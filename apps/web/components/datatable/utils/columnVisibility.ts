import type { ColumnDef, VisibilityState } from "@tanstack/react-table";

const PREFERENCE_PREFIX = "datatable.columns.";

/** Preference key under which a table's column visibility is stored. */
export function columnPreferenceKey(tableId: string): string {
  return `${PREFERENCE_PREFIX}${tableId}`;
}

function columnId<T>(col: ColumnDef<T>): string | undefined {
  return (col as any).id ?? (col as any).accessorKey;
}

/**
 * Compute the initial column visibility from column meta. A column starts
 * hidden when it is suppressed (filter/sort-only) or has `defaultVisible:
 * false`. Columns that are visible by default are omitted (TanStack treats
 * absent entries as visible).
 */
export function computeDefaultColumnVisibility<T>(
  columns: ColumnDef<T>[],
): VisibilityState {
  const visibility: VisibilityState = {};
  columns.forEach((col) => {
    const id = columnId(col);
    if (!id) return;
    const meta = col.meta;
    if (meta?.isSuppressed || meta?.defaultVisible === false) {
      visibility[id] = false;
    }
  });
  return visibility;
}

/** Column ids the user is allowed to toggle (excludes suppressed / non-hideable). */
export function getHideableColumnIds<T>(columns: ColumnDef<T>[]): Set<string> {
  const ids = new Set<string>();
  columns.forEach((col) => {
    const id = columnId(col);
    if (!id) return;
    const meta = col.meta;
    if (meta?.isSuppressed || meta?.isHideable === false) {
      return;
    }
    ids.add(id);
  });
  return ids;
}

/** Parse a stored preference value into a visibility map, ignoring malformed data. */
export function parseSavedVisibility(
  raw: string | undefined,
): VisibilityState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const out: VisibilityState = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "boolean") out[key] = value;
    }
    return out;
  } catch {
    return null;
  }
}

/**
 * Overlay a saved visibility map onto the computed defaults, only for columns
 * the user is allowed to toggle. Saved entries for unknown or non-hideable
 * columns are ignored so stale preferences can never reveal a suppressed column.
 */
export function mergeSavedVisibility(
  defaults: VisibilityState,
  saved: VisibilityState | null,
  hideableIds: Set<string>,
): VisibilityState {
  if (!saved) return defaults;
  const next = { ...defaults };
  for (const id of hideableIds) {
    if (id in saved) next[id] = saved[id];
  }
  return next;
}

/** Serialise the visibility of the user-toggleable columns for storage. */
export function serializeColumnVisibility(
  visibility: VisibilityState,
  hideableIds: Set<string>,
): string {
  const toSave: VisibilityState = {};
  for (const id of hideableIds) {
    toSave[id] = visibility[id] !== false;
  }
  return JSON.stringify(toSave);
}
