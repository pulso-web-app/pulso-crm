import { Timestamp } from 'firebase/firestore';
import { decodeContact, normalizeContactSearch } from './contact-document';

const document = {
  organizationName: 'Órbita Design',
  organizationNameSearch: 'orbita design',
  stage: 'client',
  status: 'new',
  lastContactAt: '2026-09-02T12:00:00Z',
};

describe('Contact document contract', () => {
  it('accepts an explicitly unknown last-contact date', () => {
    expect(
      decodeContact('new', { ...document, lastContactAt: null }).lastContactAt,
    ).toBeNull();
  });
  it('normalizes accented names and surrounding whitespace', () => {
    expect(normalizeContactSearch('  ÓRBITA Design  ')).toBe('orbita design');
  });

  it('uses the Firestore document identity and accepts absent optional fields', () => {
    expect(
      decodeContact('document-id', { ...document, id: 'untrusted-id' }),
    ).toEqual({
      id: 'document-id',
      organizationName: 'Órbita Design',
      stage: 'client',
      status: 'new',
      lastContactAt: '2026-09-02T12:00:00.000Z',
      activities: [],
      contactName: undefined,
      instagramHandle: undefined,
      instagramProfileUrl: undefined,
      whatsappNumber: undefined,
    });
  });

  it('accepts Firestore timestamps and validates stored activities', () => {
    const timestamp = Timestamp.fromDate(new Date('2026-09-02T12:00:00Z'));
    const result = decodeContact('id', {
      ...document,
      lastContactAt: timestamp,
      activities: [
        { text: 'Test', createdAt: timestamp, updatedAt: timestamp },
      ],
    });
    expect(result.lastContactAt).toBe('2026-09-02T12:00:00.000Z');
    expect(result.activities[0].createdAt).toBe(result.lastContactAt);
  });

  it.each([
    null,
    {},
    { ...document, organizationName: ' ' },
    { ...document, organizationNameSearch: 'wrong' },
    { ...document, stage: 'invalid' },
    { ...document, status: 'invalid' },
    { ...document, lastContactAt: 'yesterday' },
    { ...document, contactName: 12 },
    { ...document, activities: 'invalid' },
    {
      ...document,
      activities: [{ text: 'Test', createdAt: null, updatedAt: null }],
    },
  ])(
    'rejects malformed records instead of fabricating contacts: %j',
    (value) => {
      expect(() => decodeContact('id', value)).toThrow();
    },
  );
});
