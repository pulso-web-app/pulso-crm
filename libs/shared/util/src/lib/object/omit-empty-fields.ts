/**
 * Trims string values and removes empty strings and undefined properties from
 * a plain data object. Callers are responsible for validating required fields.
 */
export function omitEmptyFields<T extends Record<string, unknown>>(
  object: T,
): T {
  const entries = Object.entries(object)
    .map(([key, value]) => [
      key,
      typeof value === 'string' ? value.trim() : value,
    ])
    .filter(([, value]) => value !== '' && value !== undefined);

  return Object.fromEntries(entries) as T;
}
