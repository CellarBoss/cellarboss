// Highest ID handed out per collection array. Keyed on the array itself, so a
// collection replaced by /__test/set-state or /__test/reset starts afresh from
// its contents, while deleting rows (which mutates the array) never frees an ID.
const issued = new WeakMap<object, number>();

/**
 * Returns the next free numeric ID for a collection: one more than the highest
 * ID it holds or has been issued, starting at 1. Deriving the ID from state
 * (rather than a module-level counter) keeps it unique after /__test/set-state
 * installs arbitrary IDs, and deterministic after /__test/reset.
 */
export function nextId(rows: ReadonlyArray<{ id: number }>): number {
  const id =
    rows.reduce((max, row) => Math.max(max, row.id), issued.get(rows) ?? 0) + 1;
  issued.set(rows, id);
  return id;
}

/**
 * Returns the next free `${prefix}${n}` string ID for a collection, following
 * the same rules as nextId.
 */
export function nextPrefixedId(
  rows: ReadonlyArray<{ id: string }>,
  prefix: string,
): string {
  const n =
    rows.reduce(
      (max, row) => {
        if (!row.id.startsWith(prefix)) return max;
        const value = Number(row.id.slice(prefix.length));
        return Number.isInteger(value) ? Math.max(max, value) : max;
      },
      issued.get(rows) ?? 0,
    ) + 1;
  issued.set(rows, n);
  return `${prefix}${n}`;
}
