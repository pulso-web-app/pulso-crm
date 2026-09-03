import { describe, expect, it } from 'vitest';
import {
  CONTACT_IMPORT_AI_PROMPT,
  CONTACT_IMPORT_EXAMPLE,
  CONTACT_IMPORT_LIMIT,
  formatContactImportIssue,
  parseContactImportJson,
  validateContactImport,
} from './contact-import';

describe('contact import contract', () => {
  it('applies defaults and trims a minimal contact', () => {
    expect(
      parseContactImportJson('[{"organizationName":"  Órbita  "}]'),
    ).toEqual({
      valid: true,
      contacts: [
        {
          organizationName: 'Órbita',
          stage: 'contact',
          status: 'new',
          lastContactAt: null,
          activities: [],
        },
      ],
    });
  });

  it('preserves complete input, normalizes ISO dates, and omits blank optional text', () => {
    const result = validateContactImport([
      {
        organizationName: 'Empresa',
        contactName: ' Ana ',
        instagramHandle: ' ',
        instagramProfileUrl: 'https://instagram.com/empresa',
        whatsappNumber: '11999999999',
        stage: 'client',
        status: 'contacted',
        lastContactAt: '2026-09-03T11:30:00-03:00',
        activities: [
          {
            text: ' Conversa inicial ',
            createdAt: '2026-09-03T14:30:00Z',
            updatedAt: '2026-09-03T14:40:00Z',
          },
        ],
      },
    ]);
    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.contacts[0]).toEqual(
      expect.objectContaining({
        organizationName: 'Empresa',
        contactName: 'Ana',
        stage: 'client',
        lastContactAt: '2026-09-03T14:30:00.000Z',
        activities: [
          {
            text: 'Conversa inicial',
            createdAt: '2026-09-03T14:30:00.000Z',
            updatedAt: '2026-09-03T14:40:00.000Z',
          },
        ],
      }),
    );
    expect(result.contacts[0]).not.toHaveProperty('instagramHandle');
  });

  it.each([
    ['malformed JSON', '{', 'O conteúdo não é um JSON válido.'],
    ['non-array root', '{}', 'O JSON deve começar com uma lista'],
    ['empty array', '[]', 'Inclua pelo menos um contato'],
  ])('rejects %s', (_label, source, message) => {
    const result = parseContactImportJson(source);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues[0].message).toContain(message);
  });

  it('rejects more than the atomic limit', () => {
    const result = validateContactImport(
      Array.from({ length: CONTACT_IMPORT_LIMIT + 1 }, () => ({
        organizationName: 'Empresa',
      })),
    );
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.issues[0].message).toContain('500');
  });

  it('reports positions and paths for invalid, internal, and unknown fields', () => {
    const result = validateContactImport([
      { organizationName: 'Válido' },
      {
        organizationName: ' ',
        id: 'forbidden',
        stage: 'unknown',
        status: 1,
        lastContactAt: '03/09/2026',
        activities: [
          { text: '', createdAt: 'invalid', updatedAt: null, extra: true },
        ],
      },
    ]);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    const messages = result.issues.map(formatContactImportIssue);
    expect(messages).toContain('Contato 2 → id: campo não permitido.');
    expect(messages).toContain('Contato 2 → stage: valor inválido.');
    expect(messages).toContain(
      'Contato 2 → activities[0].createdAt: deve ser uma data ISO válida.',
    );
  });

  it('rejects wrong item, optional field, and activities types', () => {
    const result = validateContactImport([
      null,
      { organizationName: 'Empresa', contactName: 42, activities: {} },
    ]);
    expect(result.valid).toBe(false);
    if (!result.valid)
      expect(result.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            contactIndex: 1,
            message: 'deve ser um objeto.',
          }),
          expect.objectContaining({ contactIndex: 2, field: 'contactName' }),
          expect.objectContaining({ contactIndex: 2, field: 'activities' }),
        ]),
      );
  });

  it('allows identical contacts and provides valid deterministic copy helpers', () => {
    const contact = { organizationName: 'Repetida' };
    const result = validateContactImport([contact, contact]);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.contacts).toHaveLength(2);
    expect(parseContactImportJson(CONTACT_IMPORT_EXAMPLE).valid).toBe(true);
    expect(CONTACT_IMPORT_AI_PROMPT).toContain(
      'Responda somente com o array JSON válido',
    );
    expect(CONTACT_IMPORT_AI_PROMPT).toContain('no-response');
  });
});
