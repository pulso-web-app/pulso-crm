import { parseArgs } from 'node:util';
import { firestoreClient } from './firestore-client.mjs';

const SEED_ID = 'crm-directory-v1';
const organizations = [
  'Ágata Laboratório',
  'Aurora Studio',
  'Brisa Design',
  'Cais Tecnologia',
  'Cedro Consultoria',
  'Círculo Educação',
  'Delta Sistemas',
  'Elo Arquitetura',
  'Estrela Serviços',
  'Farol Marketing',
  'Flora Paisagismo',
  'Horizonte Logística',
  'Íris Comunicação',
  'Jade Engenharia',
  'Lagoa Turismo',
  'Lume Contabilidade',
  'Maré Digital',
  'Norte Soluções',
  'Órbita Design',
  'Órbita Design',
  'Pérola Comércio',
  'Ponte Negócios',
  'Prisma Finanças',
  'Raiz Alimentos',
  'Riacho Produções',
  'Sol Tecnologia',
  'Terra Projetos',
  'Trilha Esportes',
  'União Consultoria',
  'Vale Saúde',
  'Vento Criativo',
  'Vila Eventos',
  'Viva Educação',
  'Xisto Design',
  'Zênite Logística',
  'Zínia Artes',
];
const stages = [
  'contact',
  'cold-lead',
  'warm-lead',
  'hot-lead',
  'client',
  'no-response',
  'not-interested',
];
const statuses = ['new', 'contacted', 'awaiting-response', 'closed'];

async function main() {
  const { values } = parseArgs({
    options: {
      project: { type: 'string' },
      'dry-run': { type: 'boolean', default: false },
    },
  });
  const client = await firestoreClient(values.project);
  const documents = organizations.map((organization, index) => {
    const suffix = String(index + 1).padStart(3, '0');
    const name = `${client.database}/documents/contacts/seed-${SEED_ID}-${suffix}`;
    const organizationName = `${organization} (Teste)`;
    const data = {
      organizationName,
      organizationNameSearch: organizationName
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLocaleLowerCase('pt-BR'),
      contactName: `Pessoa de teste ${suffix}`,
      stage: stages[index % stages.length],
      status: statuses[index % statuses.length],
      seedId: SEED_ID,
      ...(index % 3 === 0 ? {} : { instagramHandle: `@pulso_test_${suffix}` }),
    };
    const fields = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, { stringValue: value }]),
    );
    fields['lastContactAt'] = {
      timestampValue: new Date(Date.UTC(2026, 8, 2 - index, 12)).toISOString(),
    };
    fields['activities'] = { arrayValue: { values: [] } };
    return { name, fields };
  });
  const existing = await client.firestore('documents:batchGet', {
    documents: documents.map(({ name }) => name),
  });
  const found = new Set(
    existing.filter((item) => item.found).map((item) => item.found.name),
  );
  const writes = documents
    .filter(({ name }) => !found.has(name))
    .map((document) => ({
      update: document,
      currentDocument: { exists: false },
    }));
  if (!values['dry-run'] && writes.length)
    await client.firestore('documents:commit', { writes });
  console.log(
    JSON.stringify({
      project: values.project,
      collection: 'contacts',
      seedId: SEED_ID,
      dryRun: values['dry-run'],
      created: values['dry-run'] ? 0 : writes.length,
      planned: writes.length,
      skipped: found.size,
    }),
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
