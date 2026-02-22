/**
 * Parse a string to a number and validate it's a valid integer ID.
 * Returns the number if valid, null if invalid.
 */
export function parseId(value: string | undefined): number | null {
  if (!value) return null;
  const id = Number(value);
  if (isNaN(id)) return null;
  return id;
}
