import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { firestoreClient } from './firestore-client.mjs';
import {
  planSharedDataMigration,
  readLegacyBusinessDocuments,
} from './shared-data-migration.mjs';

async function main() {
  const { values } = parseArgs({
    options: {
      project: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  const client = await firestoreClient(values.project);
  const documents = await readLegacyBusinessDocuments(client);
  const preview = planSharedDataMigration(documents, client.database);
  const targets = preview.flatMap(({ writes }) =>
    writes.filter((write) => write.update).map((write) => write.update.name),
  );
  const existing = [];
  for (let index = 0; index < targets.length; index += 100) {
    const result = await client.firestore('documents:batchGet', {
      documents: targets.slice(index, index + 100),
    });
    existing.push(
      ...result.filter((item) => item.found).map((item) => item.found.name),
    );
  }
  const plan = planSharedDataMigration(documents, client.database, existing);
  let backup;
  if (!values['dry-run'] && documents.length) {
    const directory = new URL('../tmp/shared-data-backups/', import.meta.url);
    await mkdir(directory, { recursive: true });
    backup = fileURLToPath(
      new URL(`${values.project}-${Date.now()}.json`, directory),
    );
    await writeFile(
      backup,
      JSON.stringify({ database: client.database, documents }, null, 2),
      { flag: 'wx' },
    );
    for (const { sourceRoot, writes } of plan) {
      await client.firestore('documents:commit', { writes });
      console.log(
        JSON.stringify({ migrated: sourceRoot, documents: writes.length / 2 }),
      );
    }
  }
  console.log(
    JSON.stringify({
      project: values.project,
      dryRun: values['dry-run'],
      documents: documents.length,
      trees: plan.length,
      backup,
    }),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
