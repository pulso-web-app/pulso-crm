export function sharedDocumentName(name, database) {
  const prefix = `${database}/documents/users/`;
  if (!name.startsWith(prefix)) return null;
  const [userId, collection, id, ...descendants] = name
    .slice(prefix.length)
    .split('/');
  if (
    !userId ||
    !['contacts', 'projects'].includes(collection) ||
    !id ||
    descendants.length % 2 ||
    descendants.some((part) => !part)
  )
    return null;
  return `${database}/documents/${[collection, id, ...descendants].join('/')}`;
}

function moveReferences(value, database) {
  if (Array.isArray(value))
    return value.map((item) => moveReferences(item, database));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      key === 'referenceValue' && typeof item === 'string'
        ? (sharedDocumentName(item, database) ?? item)
        : moveReferences(item, database),
    ]),
  );
}

export function planSharedDataMigration(
  documents,
  database,
  existingNames = [],
) {
  const destinations = new Set(existingNames);
  const groups = new Map();
  for (const source of documents) {
    const destination = sharedDocumentName(source.name, database);
    if (!destination || !source.updateTime)
      throw new Error(`Invalid or unversioned legacy document: ${source.name}`);
    if (destinations.has(destination))
      throw new Error(`Destination collision: ${destination}`);
    destinations.add(destination);
    const sourcePath = source.name
      .slice(`${database}/documents/`.length)
      .split('/');
    const root = sourcePath.slice(0, 4).join('/');
    if (!groups.has(root)) groups.set(root, []);
    groups
      .get(root)
      .push(
        {
          update: {
            name: destination,
            fields: moveReferences(source.fields ?? {}, database),
          },
          currentDocument: { exists: false },
        },
        {
          delete: source.name,
          currentDocument: { updateTime: source.updateTime },
        },
      );
  }
  for (const [root, writes] of groups) {
    if (writes.length > 500)
      throw new Error(`Legacy tree exceeds the atomic commit limit: ${root}`);
  }
  return [...groups].map(([sourceRoot, writes]) => ({ sourceRoot, writes }));
}

async function listDocuments(client, parent, collectionId) {
  const documents = [];
  let pageToken;
  do {
    const params = new URLSearchParams({
      pageSize: '300',
      showMissing: 'true',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const result = await client.firestore(
      `${parent}/${encodeURIComponent(collectionId)}?${params}`,
    );
    documents.push(...(result.documents ?? []));
    pageToken = result.nextPageToken;
  } while (pageToken);
  return documents;
}

async function listCollections(client, documentPath) {
  const collections = [];
  let pageToken;
  do {
    const result = await client.firestore(`${documentPath}:listCollectionIds`, {
      pageSize: 300,
      ...(pageToken ? { pageToken } : {}),
    });
    collections.push(...(result.collectionIds ?? []));
    pageToken = result.nextPageToken;
  } while (pageToken);
  return collections;
}

export async function readLegacyBusinessDocuments(client) {
  const documents = [];
  const visit = async (document) => {
    // Missing ancestors can contain real subcollections in Firestore.
    if (document.updateTime) documents.push(document);
    const path = document.name.slice(`${client.database}/`.length);
    for (const collection of await listCollections(client, path)) {
      for (const child of await listDocuments(client, path, collection))
        await visit(child);
    }
  };
  for (const user of await listDocuments(client, 'documents', 'users')) {
    const parent = user.name.slice(`${client.database}/`.length);
    for (const collection of ['contacts', 'projects']) {
      for (const document of await listDocuments(client, parent, collection))
        await visit(document);
    }
  }
  return documents;
}
