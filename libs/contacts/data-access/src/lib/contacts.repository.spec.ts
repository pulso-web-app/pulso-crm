import { TestBed } from '@angular/core/testing';
import { deleteApp, FirebaseApp, initializeApp } from 'firebase/app';
import {
  collection,
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
  where,
} from 'firebase/firestore';
import { vi } from 'vitest';
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
    },
  ),
);

describe('ContactsRepository', () => {
  let app: FirebaseApp;
  let repository: ContactsRepository;
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
