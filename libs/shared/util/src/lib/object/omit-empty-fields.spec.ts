import { omitEmptyFields } from './omit-empty-fields';

describe('omitEmptyFields', () => {
  it('trims strings and omits empty and undefined fields', () => {
    expect(
      omitEmptyFields({
        organizationName: '  ACME Tecnologia  ',
        contactName: '   ',
        instagramHandle: undefined,
      }),
    ).toEqual({ organizationName: 'ACME Tecnologia' });
  });

  it('preserves meaningful falsy values and non-string values', () => {
    const activities = [{ text: 'Entrou em contato' }];
    const metadata = { source: 'manual' };

    expect(
      omitEmptyFields({
        active: false,
        attempts: 0,
        nullable: null,
        activities,
        metadata,
      }),
    ).toEqual({
      active: false,
      attempts: 0,
      nullable: null,
      activities,
      metadata,
    });
  });

  it('does not mutate the source object', () => {
    const source = { name: '  Maria  ', optional: '' };

    const result = omitEmptyFields(source);

    expect(result).toEqual({ name: 'Maria' });
    expect(source).toEqual({ name: '  Maria  ', optional: '' });
  });
});
