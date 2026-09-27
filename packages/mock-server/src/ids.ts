/**
 * Returns the next free numeric ID for a collection: one more than the highest
 * existing ID, or 1 when the collection is empty. Deriving the ID from state
 * (rather than a module-level counter) keeps it unique after /__test/set-state
 * installs arbitrary IDs, and deterministic after /__test/reset.
 */
export function nextId(rows: ReadonlyArray<{ id: number }>): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}
