export function nullableNotes(value: string | null | undefined) {
  if (value === null || value === undefined) return null;
  return value.trim() === "" ? null : value;
}
