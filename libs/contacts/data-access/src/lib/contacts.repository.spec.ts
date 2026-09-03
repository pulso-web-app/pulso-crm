import { TestBed } from '@angular/core/testing';
import { deleteApp, FirebaseApp, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  deleteField,
  documentId,
  endBefore,
  getCountFromServer,
  getDocsFromServer,
  getFirestore,
  limit,
  limitToLast,
  orderBy,
  query,
  queryEqual,
  startAfter,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { vi } from 'vitest';
import { Contact } from './contact.models';
import {
  ContactsRepository,
  provideContactsDataAccess,
} from './contacts.repository';

vi.mock('firebase/firestore', async (importOriginal) =>
  Object.assign(
    {},
    await importOriginal<typeof import('firebase/firestore')>(),
    {
      getDocsFromServer: vi.fn(),
      getCountFromServer: vi.fn(),
      updateDoc: vi.fn().mockResolvedValue(undefined),
      addDoc: vi.fn(),
      writeBatch: vi.fn(),
    },
  ),
);

describe('ContactsRepository', () => {
  let app: FirebaseApp;
  let repository: ContactsRepository;
  let batch: {
    set: ReturnType<typeof vi.fn>;
    commit: ReturnType<typeof vi.fn>;
  };
  const filter = { search: '', stage: null, status: null };
  const data = {
    organizationName: 'Órbita',
    organizationNameSearch: 'orbita',
    stage: 'client',
    status: 'new',
    lastContactAt: '2026-09-02T12:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    batch = {
      set: vi.fn(),
      commit: vi.fn().mockResolvedValue(undefined),
    };
    vi.mocked(writeBatch).mockReturnValue(batch as never);
    vi.mocked(addDoc).mockResolvedValue({ id: 'generated-contact' } as never);
    app = initializeApp(
      { projectId: 'unit-tests', apiKey: 'unit-test-key' },
      `test-${Math.random()}`,
    );
    TestBed.configureTestingModule({
      providers: [provideContactsDataAccess(() => app)],
    });
    repository = TestBed.inject(ContactsRepository);
    vi.mocked(getDocsFromServer).mockResolvedValue({
      docs: [
        { id: 'a', data: () => data },
        { id: 'b', data: () => data },
      ],
    } as never);
    vi.mocked(getCountFromServer).mockResolvedValue({
      data: () => ({ count: 36 }),
    } as never);
  });

  afterEach(async () => {
    await deleteApp(app);
  });

  function base() {
    return query(
      collection(getFirestore(app), 'contacts'),
      orderBy('organizationNameSearch'),
      orderBy(documentId()),
    );
  }

  const contact: Contact = {
    id: 'contact-a',
    organizationName: 'Órbita',
    stage: 'client',
    status: 'new',
    lastContactAt: '2026-09-02T12:00:00Z',
    activities: [],
  };

  it.each([undefined, '', '   '])(
    'removes optional fields with value %j instead of sending undefined or blank text',
    async (value) => {
      await repository.updateContact({
        ...contact,
        contactName: value,
        instagramHandle: value,
        instagramProfileUrl: value,
        whatsappNumber: value,
      });

      expect(updateDoc).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ path: 'contacts/contact-a' }),
        {
          organizationName: 'Órbita',
          organizationNameSearch: 'orbita',
          stage: 'client',
          status: 'new',
          lastContactAt: contact.lastContactAt,
          activities: [],
          contactName: deleteField(),
          instagramHandle: deleteField(),
          instagramProfileUrl: deleteField(),
          whatsappNumber: deleteField(),
        },
      );
    },
  );

  it('creates a clean shared document with generated identity and no invented last contact', async () => {
    const created = await repository.createContact({
      organizationName: '  Órbita  ',
      stage: 'contact',
      status: 'new',
      lastContactAt: null,
      activities: [],
      instagramHandle: ' ',
      contactName: '  Ana  ',
    });
    expect(addDoc).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ path: 'contacts' }),
      {
        organizationName: 'Órbita',
        organizationNameSearch: 'orbita',
        stage: 'contact',
        status: 'new',
        lastContactAt: null,
        activities: [],
        contactName: 'Ana',
      },
    );
    expect(created).toEqual(
      expect.objectContaining({
        id: 'generated-contact',
        organizationName: 'Órbita',
        contactName: 'Ana',
        lastContactAt: null,
      }),
    );
    expect(created.instagramHandle).toBeUndefined();
    expect(updateDoc).not.toHaveBeenCalled();
  });

  it('preserves entered activities when creating and propagates creation failures', async () => {
    const activity = {
      text: 'Requested a proposal',
      createdAt: '2026-09-02T12:00:00Z',
      updatedAt: '2026-09-02T12:00:00Z',
    };
    await repository.createContact({ ...contact, activities: [activity] });
    expect(vi.mocked(addDoc).mock.calls[0][1]).toEqual(
      expect.objectContaining({ activities: [activity] }),
    );
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('permission-denied'));
    await expect(repository.createContact(contact)).rejects.toThrow(
      'permission-denied',
    );
  });

  it('imports normalized contacts through one atomic commit and returns generated IDs', async () => {
    const imported = await repository.importContacts([
      {
        organizationName: '  Órbita  ',
        contactName: '  Ana  ',
        stage: 'contact',
        status: 'new',
        lastContactAt: null,
        activities: [],
      },
      {
        organizationName: 'Farol',
        stage: 'client',
        status: 'contacted',
        lastContactAt: '2026-09-03T14:30:00.000Z',
        activities: [],
      },
    ]);
    expect(writeBatch).toHaveBeenCalledTimes(1);
    expect(batch.set).toHaveBeenCalledTimes(2);
    expect(batch.set.mock.calls[0][1]).toEqual({
      organizationName: 'Órbita',
      organizationNameSearch: 'orbita',
      contactName: 'Ana',
      stage: 'contact',
      status: 'new',
      lastContactAt: null,
      activities: [],
    });
    expect(batch.commit).toHaveBeenCalledTimes(1);
    expect(imported).toHaveLength(2);
    expect(imported.every(({ id }) => Boolean(id))).toBe(true);
  });

  it('rejects an invalid import before allocating or committing a batch', async () => {
    await expect(
      repository.importContacts([
        {
          organizationName: '',
          stage: 'contact',
          status: 'new',
          lastContactAt: null,
          activities: [],
        },
      ]),
    ).rejects.toThrow('Invalid contact import');
    expect(writeBatch).not.toHaveBeenCalled();
  });

  it('propagates atomic commit failure without returning imported contacts', async () => {
    batch.commit.mockRejectedValueOnce(new Error('permission-denied'));
    await expect(
      repository.importContacts([
        {
          organizationName: 'Órbita',
          stage: 'contact',
          status: 'new',
          lastContactAt: null,
          activities: [],
        },
      ]),
    ).rejects.toThrow('permission-denied');
    expect(batch.set).toHaveBeenCalledTimes(1);
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid creation before writing', async () => {
    await expect(
      repository.createContact({ ...contact, organizationName: '  ' }),
    ).rejects.toThrow();
    expect(addDoc).not.toHaveBeenCalled();
  });

  it('saves populated optional fields and activity history', async () => {
    const fields = {
      contactName: 'Ana',
      instagramHandle: '@orbita',
      instagramProfileUrl: 'https://www.instagram.com/orbita/',
      whatsappNumber: '11999999999',
      activities: [
        {
          text: 'Proposal sent',
          createdAt: '2026-09-02T12:00:00Z',
          updatedAt: '2026-09-02T12:00:00Z',
        },
      ],
    };
    await repository.updateContact({ ...contact, ...fields });
    expect(updateDoc).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ path: 'contacts/contact-a' }),
      expect.objectContaining(fields),
    );
  });

  it('fetches only the bounded first page from the shared contacts collection', async () => {
    const page = await repository.readPage({
      filter,
      size: 9,
      direction: 'first',
    });
    expect(
      queryEqual(
        vi.mocked(getDocsFromServer).mock.calls[0][0],
        query(base(), limit(9)),
      ),
    ).toBe(true);
    expect(page.first).toEqual({ name: 'orbita', id: 'a' });
    expect(page.last).toEqual({ name: 'orbita', id: 'b' });
  });

  it('combines normalized prefix, stage, and status on the server', async () => {
    await repository.readPage({
      filter: { search: ' ÓR ', stage: 'client', status: 'new' },
      size: 18,
      direction: 'first',
    });
    const expected = query(
      base(),
      where('stage', '==', 'client'),
      where('status', '==', 'new'),
      where('organizationNameSearch', '>=', 'or'),
      where('organizationNameSearch', '<=', 'or\uf8ff'),
      limit(18),
    );
    expect(
      queryEqual(vi.mocked(getDocsFromServer).mock.calls[0][0], expected),
    ).toBe(true);
  });

  it('advances past the document ID when names are identical', async () => {
    await repository.readPage({
      filter,
      size: 9,
      direction: 'next',
      cursor: { name: 'orbita', id: 'a' },
    });
    expect(
      queryEqual(
        vi.mocked(getDocsFromServer).mock.calls[0][0],
        query(base(), startAfter('orbita', 'a'), limit(9)),
      ),
    ).toBe(true);
  });

  it('reads the preceding page without downloading earlier pages', async () => {
    await repository.readPage({
      filter,
      size: 9,
      direction: 'previous',
      cursor: { name: 'orbita', id: 'b' },
    });
    expect(
      queryEqual(
        vi.mocked(getDocsFromServer).mock.calls[0][0],
        query(base(), endBefore('orbita', 'b'), limitToLast(9)),
      ),
    ).toBe(true);
  });

  it('fetches a partial last page directly', async () => {
    await repository.readPage({ filter, size: 2, direction: 'last' });
    expect(
      queryEqual(
        vi.mocked(getDocsFromServer).mock.calls[0][0],
        query(base(), limitToLast(2)),
      ),
    ).toBe(true);
  });

  it('returns an empty page without invented cursors', async () => {
    vi.mocked(getDocsFromServer).mockResolvedValue({ docs: [] } as never);
    expect(
      await repository.readPage({
        filter,
        size: 9,
        direction: 'first',
      }),
    ).toEqual({ contacts: [], first: null, last: null });
  });

  it('uses an unbounded aggregation query for the matching count', async () => {
    expect(await repository.count({ ...filter, stage: 'client' })).toBe(36);
    expect(
      queryEqual(
        vi.mocked(getCountFromServer).mock.calls[0][0],
        query(base(), where('stage', '==', 'client')),
      ),
    ).toBe(true);
    expect(getDocsFromServer).not.toHaveBeenCalled();
  });

  it('reads summary values with aggregations instead of downloading contacts', async () => {
    const result = await repository.summary();
    expect(result.total).toBe(36);
    expect(result.client).toBe(36);
    expect(getCountFromServer).toHaveBeenCalledTimes(7);
    expect(getDocsFromServer).not.toHaveBeenCalled();
  });

  it('propagates permission and malformed-document failures', async () => {
    vi.mocked(getDocsFromServer).mockRejectedValueOnce(
      new Error('permission-denied'),
    );
    await expect(
      repository.readPage({ filter, size: 9, direction: 'first' }),
    ).rejects.toThrow('permission-denied');
    vi.mocked(getDocsFromServer).mockResolvedValueOnce({
      docs: [{ id: 'bad', data: () => ({}) }],
    } as never);
    await expect(
      repository.readPage({ filter, size: 9, direction: 'first' }),
    ).rejects.toThrow();
  });

  it('rejects unbounded page sizes before reading', async () => {
    await expect(
      repository.readPage({ filter, size: 1000, direction: 'first' }),
    ).rejects.toThrow();
    expect(getDocsFromServer).not.toHaveBeenCalled();
  });
});
