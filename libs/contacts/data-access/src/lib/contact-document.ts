import {
  CONTACT_STAGE_OPTIONS,
  CONTACT_STATUS_OPTIONS,
  Contact,
  ContactActivity,
} from './contact.models';

export function normalizeContactSearch(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR');
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Invalid contact document.');
  }
  return value as Record<string, unknown>;
}

function text(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Invalid contact text field.');
  }
  return value;
}

function optionalText(value: unknown): string | undefined {
  return value == null || value === '' ? undefined : text(value);
}

function date(value: unknown): string {
  // Firestore Timestamp exposes toDate; strings support imported ISO dates.
  const parsed =
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof value.toDate === 'function'
      ? value.toDate()
      : new Date(text(value));
  if (!(parsed instanceof Date) || !Number.isFinite(parsed.getTime())) {
    throw new Error('Invalid contact date.');
  }
  return parsed.toISOString();
}

export function decodeContact(id: string, value: unknown): Contact {
  const data = record(value);
  const stage = CONTACT_STAGE_OPTIONS.find(
    ({ value }) => value === data['stage'],
  )?.value;
  const status = CONTACT_STATUS_OPTIONS.find(
    ({ value }) => value === data['status'],
  )?.value;
  if (!stage || !status) throw new Error('Invalid contact classification.');
  const organizationName = text(data['organizationName']);
  if (
    data['organizationNameSearch'] !== normalizeContactSearch(organizationName)
  ) {
    throw new Error('Invalid contact search field.');
  }
  const activities = data['activities'] ?? [];
  if (!Array.isArray(activities))
    throw new Error('Invalid contact activities.');
  return {
    id: text(id),
    organizationName,
    contactName: optionalText(data['contactName']),
    instagramHandle: optionalText(data['instagramHandle']),
    instagramProfileUrl: optionalText(data['instagramProfileUrl']),
    whatsappNumber: optionalText(data['whatsappNumber']),
    stage,
    status,
    lastContactAt: date(data['lastContactAt']),
    activities: activities.map((value): ContactActivity => {
      const activity = record(value);
      return {
        text: text(activity['text']),
        createdAt: date(activity['createdAt']),
        updatedAt: date(activity['updatedAt']),
      };
    }),
  };
}
