import {
  CONTACT_STAGE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  ContactActivity,
  ContactInput,
  ContactStage,
  ContactStatus,
} from './contact.models';

export const CONTACT_IMPORT_LIMIT = 500;

export interface ContactImportIssue {
  readonly message: string;
  readonly contactIndex?: number;
  readonly field?: string;
}

export type ContactImportResult =
  | { readonly valid: true; readonly contacts: readonly ContactInput[] }
  | { readonly valid: false; readonly issues: readonly ContactImportIssue[] };

const CONTACT_FIELDS = new Set([
  'organizationName',
  'contactName',
  'instagramHandle',
  'instagramProfileUrl',
  'whatsappNumber',
  'stage',
  'status',
  'lastContactAt',
  'activities',
]);
const ACTIVITY_FIELDS = new Set(['text', 'createdAt', 'updatedAt']);
const STAGES = new Set(CONTACT_STAGE_OPTIONS.map(({ value }) => value));
const STATUSES = new Set(CONTACT_STATUS_OPTIONS.map(({ value }) => value));

export const CONTACT_IMPORT_EXAMPLE = JSON.stringify(
  [
    {
      organizationName: 'Empresa Exemplo',
      contactName: 'Ana Silva',
      instagramHandle: '@empresa.exemplo',
      instagramProfileUrl: 'https://www.instagram.com/empresa.exemplo/',
      whatsappNumber: '11999999999',
      stage: 'warm-lead',
      status: 'contacted',
      lastContactAt: '2026-09-03T14:30:00.000Z',
      activities: [
        {
          text: 'Apresentação inicial realizada',
          createdAt: '2026-09-03T14:30:00.000Z',
          updatedAt: '2026-09-03T14:30:00.000Z',
        },
      ],
    },
  ],
  null,
  2,
);

export const CONTACT_IMPORT_AI_PROMPT = `Gere um array JSON de contatos para importação no Pulso CRM.

Responda somente com o array JSON válido, sem markdown, comentários ou explicações.

Cada objeto aceita estes campos:
- organizationName: texto obrigatório e não vazio.
- contactName, instagramHandle, instagramProfileUrl e whatsappNumber: textos opcionais.
- stage: um de ${CONTACT_STAGE_OPTIONS.map(({ value }) => value).join(', ')}. Se omitido, será contact.
- status: um de ${CONTACT_STATUS_OPTIONS.map(({ value }) => value).join(', ')}. Se omitido, será new.
- lastContactAt: data e hora ISO 8601 ou null. Se omitido, será null.
- activities: lista opcional. Cada atividade deve ter text, createdAt e updatedAt; as datas devem estar em ISO 8601. Se omitida, será [].

Não inclua id, organizationNameSearch nem qualquer outro campo. O array deve conter entre 1 e ${CONTACT_IMPORT_LIMIT} contatos.

Formato de referência:
${CONTACT_IMPORT_EXAMPLE}`;

export function parseContactImportJson(source: string): ContactImportResult {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return failure('O conteúdo não é um JSON válido.');
  }
  return validateContactImport(value);
}

export function validateContactImport(value: unknown): ContactImportResult {
  if (!Array.isArray(value)) {
    return failure('O JSON deve começar com uma lista de contatos.');
  }
  if (value.length === 0) {
    return failure('Inclua pelo menos um contato para importar.');
  }
  if (value.length > CONTACT_IMPORT_LIMIT) {
    return failure(
      `Importe no máximo ${CONTACT_IMPORT_LIMIT} contatos por vez.`,
    );
  }

  const contacts: ContactInput[] = [];
  const issues: ContactImportIssue[] = [];
  value.forEach((item, index) => {
    const contactIndex = index + 1;
    const itemIssues: ContactImportIssue[] = [];
    const issue = (field: string | undefined, message: string) =>
      itemIssues.push({ contactIndex, field, message });
    if (!isRecord(item)) {
      issue(undefined, 'deve ser um objeto.');
      issues.push(...itemIssues);
      return;
    }

    for (const field of Object.keys(item)) {
      if (!CONTACT_FIELDS.has(field)) issue(field, 'campo não permitido.');
    }
    const organizationName = requiredText(
      item['organizationName'],
      'organizationName',
      issue,
    );
    const contactName = optionalText(item['contactName'], 'contactName', issue);
    const instagramHandle = optionalText(
      item['instagramHandle'],
      'instagramHandle',
      issue,
    );
    const instagramProfileUrl = optionalText(
      item['instagramProfileUrl'],
      'instagramProfileUrl',
      issue,
    );
    const whatsappNumber = optionalText(
      item['whatsappNumber'],
      'whatsappNumber',
      issue,
    );
    const stage = enumValue(
      item['stage'] ?? 'contact',
      'stage',
      STAGES,
      issue,
    ) as ContactStage | undefined;
    const status = enumValue(
      item['status'] ?? 'new',
      'status',
      STATUSES,
      issue,
    ) as ContactStatus | undefined;
    const lastContactAt = nullableDate(
      item['lastContactAt'] ?? null,
      'lastContactAt',
      issue,
    );
    const activities = activityList(item['activities'] ?? [], issue);

    issues.push(...itemIssues);
    if (itemIssues.length || !organizationName || !stage || !status) return;
    contacts.push({
      organizationName,
      ...(contactName ? { contactName } : {}),
      ...(instagramHandle ? { instagramHandle } : {}),
      ...(instagramProfileUrl ? { instagramProfileUrl } : {}),
      ...(whatsappNumber ? { whatsappNumber } : {}),
      stage,
      status,
      lastContactAt: lastContactAt ?? null,
      activities: activities ?? [],
    });
  });

  return issues.length ? { valid: false, issues } : { valid: true, contacts };
}

export function formatContactImportIssue(issue: ContactImportIssue): string {
  const prefix = issue.contactIndex ? `Contato ${issue.contactIndex} → ` : '';
  const field = issue.field ? `${issue.field}: ` : '';
  return `${prefix}${field}${issue.message}`;
}

function failure(message: string): ContactImportResult {
  return { valid: false, issues: [{ message }] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

type AddIssue = (field: string | undefined, message: string) => void;

function requiredText(
  value: unknown,
  field: string,
  issue: AddIssue,
): string | undefined {
  if (typeof value !== 'string') {
    issue(field, 'deve ser um texto.');
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    issue(field, 'é obrigatório e não pode ficar vazio.');
    return undefined;
  }
  return trimmed;
}

function optionalText(
  value: unknown,
  field: string,
  issue: AddIssue,
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    issue(field, 'deve ser um texto.');
    return undefined;
  }
  return value.trim() || undefined;
}

function enumValue(
  value: unknown,
  field: string,
  values: ReadonlySet<string>,
  issue: AddIssue,
): string | undefined {
  if (typeof value !== 'string' || !values.has(value)) {
    issue(field, 'valor inválido.');
    return undefined;
  }
  return value;
}

function nullableDate(
  value: unknown,
  field: string,
  issue: AddIssue,
): string | null | undefined {
  if (value === null) return null;
  if (!isIsoDate(value)) {
    issue(field, 'deve ser uma data ISO válida ou null.');
    return undefined;
  }
  return new Date(value).toISOString();
}

function isIsoDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value) &&
    Number.isFinite(new Date(value).getTime())
  );
}

function activityList(
  value: unknown,
  issue: AddIssue,
): readonly ContactActivity[] | undefined {
  if (!Array.isArray(value)) {
    issue('activities', 'deve ser uma lista.');
    return undefined;
  }
  const activities: ContactActivity[] = [];
  value.forEach((entry, index) => {
    const path = `activities[${index}]`;
    if (!isRecord(entry)) {
      issue(path, 'deve ser um objeto.');
      return;
    }
    for (const field of Object.keys(entry)) {
      if (!ACTIVITY_FIELDS.has(field))
        issue(`${path}.${field}`, 'campo não permitido.');
    }
    const text = requiredText(entry['text'], `${path}.text`, issue);
    const createdAt = requiredIsoDate(
      entry['createdAt'],
      `${path}.createdAt`,
      issue,
    );
    const updatedAt = requiredIsoDate(
      entry['updatedAt'],
      `${path}.updatedAt`,
      issue,
    );
    if (text && createdAt && updatedAt)
      activities.push({ text, createdAt, updatedAt });
  });
  return activities;
}

function requiredIsoDate(
  value: unknown,
  field: string,
  issue: AddIssue,
): string | undefined {
  if (!isIsoDate(value)) {
    issue(field, 'deve ser uma data ISO válida.');
    return undefined;
  }
  return new Date(value).toISOString();
}
