import type { MockState } from "./index";

const USER_ID_PREFIX = "user-";

// Highest ID handed out per collection array. Keyed on the array itself, so a
// collection replaced by /__test/set-state or /__test/reset starts afresh from
// its contents, while deleting rows (which mutates the array) never frees an ID.
const issued = new WeakMap<object, number>();

function highest<T>(
  rows: ReadonlyArray<T>,
  toNumber: (row: T) => number | undefined,
): number {
  return rows.reduce(
    (max, row) => Math.max(max, toNumber(row) ?? 0),
    issued.get(rows) ?? 0,
  );
}

function allocate<T>(
  rows: ReadonlyArray<T>,
  toNumber: (row: T) => number | undefined,
): number {
  const n = highest(rows, toNumber) + 1;
  issued.set(rows, n);
  return n;
}

function numericId(row: { id: number }): number {
  return row.id;
}

function prefixedNumber(prefix: string) {
  return (row: { id: string }): number | undefined => {
    if (!row.id.startsWith(prefix)) return undefined;
    const value = Number(row.id.slice(prefix.length));
    return Number.isInteger(value) ? value : undefined;
  };
}

/**
 * Returns the next free numeric ID for a collection: one more than the highest
 * ID it holds or has been issued, starting at 1. Deriving the ID from state
 * (rather than a module-level counter) keeps it unique after /__test/set-state
 * installs arbitrary IDs, and deterministic after /__test/reset.
 */
export function nextId(rows: ReadonlyArray<{ id: number }>): number {
  return allocate(rows, numericId);
}

/**
 * Returns the next free `${prefix}${n}` string ID for a collection, following
 * the same rules as nextId.
 */
export function nextPrefixedId(
  rows: ReadonlyArray<{ id: string }>,
  prefix: string,
): string {
  return `${prefix}${allocate(rows, prefixedNumber(prefix))}`;
}

/**
 * Returns the next free user ID, following the same rules as nextId.
 */
export function nextUserId(users: MockState["users"]): string {
  return nextPrefixedId(users, USER_ID_PREFIX);
}

/**
 * Records the IDs already present in every collection, so deleting the newest
 * row before anything is created still can't free its ID. Call whenever state
 * is installed.
 */
export function trackIds(state: MockState): void {
  const collections = [
    state.wines,
    state.winemakers,
    state.vintages,
    state.regions,
    state.countries,
    state.grapes,
    state.bottles,
    state.storages,
    state.locations,
    state.wineGrapes,
    state.tastingNotes,
    state.images,
  ];
  for (const rows of collections) {
    issued.set(rows, highest(rows, numericId));
  }
  issued.set(state.users, highest(state.users, prefixedNumber(USER_ID_PREFIX)));
}
