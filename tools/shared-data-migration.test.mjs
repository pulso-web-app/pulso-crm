import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  planSharedDataMigration,
  readLegacyBusinessDocuments,
} from './shared-data-migration.mjs';

const database = 'projects/unit-test/databases/(default)';
const name = (path) => `${database}/documents/${path}`;
const document = (path, fields = {}) => ({
  name: name(path),
  fields,
  updateTime: '2026-09-02T12:00:00Z',
});

test('moves whole trees atomically, preserving IDs, fields and version preconditions', () => {
  const contact = document('users/alice/contacts/c1', {
    title: { stringValue: 'Shared' },
  });
  const interaction = document('users/alice/contacts/c1/interactions/i1');
  const project = document('users/bob/projects/p1');
  const plan = planSharedDataMigration(
    [contact, interaction, project],
    database,
  );
  assert.equal(plan.length, 2);
  assert.equal(plan[0].writes.length, 4);
  assert.deepEqual(plan[0].writes[0], {
    update: { name: name('contacts/c1'), fields: contact.fields },
    currentDocument: { exists: false },
  });
  assert.deepEqual(plan[0].writes[1], {
    delete: contact.name,
    currentDocument: { updateTime: contact.updateTime },
  });
  assert.equal(
    plan[0].writes[2].update.name,
    name('contacts/c1/interactions/i1'),
  );
  assert.equal(plan[1].writes[0].update.name, name('projects/p1'));
});

test('rewrites typed business references recursively but preserves strings and profile references', () => {
  const fields = {
    items: {
      arrayValue: {
        values: [{ referenceValue: name('users/bob/projects/p1') }],
      },
    },
    nested: {
      mapValue: {
        fields: {
          contact: { referenceValue: name('users/alice/contacts/c1') },
        },
      },
    },
    account: { referenceValue: name('users/alice') },
    text: { stringValue: name('users/alice/contacts/c1') },
  };
  const [plan] = planSharedDataMigration(
    [document('users/alice/contacts/c1', fields)],
    database,
  );
  const moved = plan.writes[0].update.fields;
  assert.equal(
    moved.items.arrayValue.values[0].referenceValue,
    name('projects/p1'),
  );
  assert.equal(
    moved.nested.mapValue.fields.contact.referenceValue,
    name('contacts/c1'),
  );
  assert.deepEqual(moved.account, fields.account);
  assert.deepEqual(moved.text, fields.text);
  assert.equal(
    fields.items.arrayValue.values[0].referenceValue,
    name('users/bob/projects/p1'),
  );
});

test('rejects collisions between users before returning any writes', () => {
  assert.throws(
    () =>
      planSharedDataMigration(
        [
          document('users/alice/contacts/c1'),
          document('users/bob/contacts/c1'),
        ],
        database,
      ),
    /collision/,
  );
});

test('never overwrites existing shared documents', () => {
  assert.throws(
    () =>
      planSharedDataMigration([document('users/alice/contacts/c1')], database, [
        name('contacts/c1'),
      ]),
    /collision/,
  );
});

test('rejects unrelated paths, absent versions and oversized trees', () => {
  assert.throws(
    () => planSharedDataMigration([document('users/alice')], database),
    /Invalid/,
  );
  assert.throws(
    () =>
      planSharedDataMigration(
        [{ name: name('users/alice/contacts/c1') }],
        database,
      ),
    /unversioned/,
  );
  const largeTree = Array.from({ length: 251 }, (_, index) =>
    document(`users/alice/contacts/c1/interactions/${index}`),
  );
  assert.throws(
    () => planSharedDataMigration(largeTree, database),
    /atomic commit limit/,
  );
});

test('a rerun without legacy data produces no writes', () => {
  assert.deepEqual(planSharedDataMigration([], database), []);
});

test('discovers descendants of missing user and contact documents with pagination', async () => {
  const interaction = document('users/alice/contacts/c1/interactions/i1');
  const calls = [];
  const client = {
    database,
    firestore: async (path, body) => {
      calls.push([path, body]);
      if (path.startsWith('documents/users?') && !path.includes('pageToken'))
        return {
          documents: [{ name: name('users/alice') }],
          nextPageToken: 'next',
        };
      if (path.startsWith('documents/users?')) return {};
      if (path.startsWith('documents/users/alice/contacts?'))
        return { documents: [{ name: name('users/alice/contacts/c1') }] };
      if (path === 'documents/users/alice/contacts/c1:listCollectionIds')
        return body.pageToken
          ? {}
          : { collectionIds: ['interactions'], nextPageToken: 'next' };
      if (path.startsWith('documents/users/alice/contacts/c1/interactions?'))
        return { documents: [interaction] };
      return {};
    },
  };
  assert.deepEqual(await readLegacyBusinessDocuments(client), [interaction]);
  assert.ok(calls.some(([path]) => path.includes('showMissing=true')));
  assert.ok(calls.some(([path]) => path.includes('pageToken=next')));
  assert.ok(calls.some(([, body]) => body?.pageToken === 'next'));
});
