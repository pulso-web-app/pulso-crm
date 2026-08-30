export type ContactStage =
  | 'contact'
  | 'cold-lead'
  | 'warm-lead'
  | 'hot-lead'
  | 'client'
  | 'no-response'
  | 'not-interested';

export type ContactStatus =
  | 'new'
  | 'contacted'
  | 'awaiting-response'
  | 'closed';

export interface ContactActivity {
  readonly text: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Contact {
  readonly id: string;
  readonly organizationName: string;
  readonly contactName?: string;
  readonly instagramHandle?: string;
  readonly instagramProfileUrl?: string;
  readonly whatsappNumber?: string;
  readonly stage: ContactStage;
  readonly status: ContactStatus;
  readonly lastContactAt: string;
  readonly activities: readonly ContactActivity[];
}

export interface ContactFilter {
  readonly search: string;
  readonly stage: ContactStage | null;
  readonly status: ContactStatus | null;
}

export interface ContactOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export const CONTACT_STAGE_OPTIONS: readonly ContactOption<ContactStage>[] = [
  { value: 'contact', label: 'Contato' },
  { value: 'cold-lead', label: 'Lead Frio' },
  { value: 'warm-lead', label: 'Lead Morno' },
  { value: 'hot-lead', label: 'Lead Quente' },
  { value: 'client', label: 'Cliente' },
  { value: 'no-response', label: 'Sem Resposta' },
  { value: 'not-interested', label: 'Não Interessado' },
];

export const CONTACT_STATUS_OPTIONS: readonly ContactOption<ContactStatus>[] = [
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'awaiting-response', label: 'Aguardando resposta' },
  { value: 'closed', label: 'Encerrado' },
];

export function contactStageLabel(stage: ContactStage): string {
  return optionLabel(CONTACT_STAGE_OPTIONS, stage);
}

export function contactStatusLabel(status: ContactStatus): string {
  return optionLabel(CONTACT_STATUS_OPTIONS, status);
}

function optionLabel<T extends string>(
  options: readonly ContactOption<T>[],
  value: T,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
