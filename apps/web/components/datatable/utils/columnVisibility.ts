import type { ColumnVisibilityState, RowData } from "@tanstack/react-table";
import type { AppColumnDef } from "../tableFeatures";
import { tablePreferenceKey } from "./tablePreferences";

/**
 * Preference key under which a table's column visibility is stored
 * (`datatable.<tableId>.columns.visibility`).
 */
export function columnPreferenceKey(tableId: string): string {
  return tablePreferenceKey(tableId, "columns", "visibility");
}

function columnId<T extends RowData>(col: AppColumnDef<T>): string | undefined {
  return (col as any).id ?? (col as any).accessorKey;
}

/**
 * Compute the initial column visibility from column meta. A column starts
 * hidden when it is suppressed (filter/sort-only) or has `defaultVisible:
 * false`. Columns that are visible by default are omitted (TanStack treats
 * absent entries as visible).
 */
export function computeDefaultColumnVisibility<T extends RowData>(
  columns: AppColumnDef<T>[],
): ColumnVisibilityState {
  const visibility: ColumnVisibilityState = {};
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
export function getHideableColumnIds<T extends RowData>(
  columns: AppColumnDef<T>[],
): Set<string> {
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
): ColumnVisibilityState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const out: ColumnVisibilityState = {};
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
  defaults: ColumnVisibilityState,
  saved: ColumnVisibilityState | null,
  hideableIds: Set<string>,
): ColumnVisibilityState {
  if (!saved) return defaults;
  const next = { ...defaults };
  for (const id of hideableIds) {
    if (id in saved) next[id] = saved[id];
  }
  return next;
}

/** Serialise the visibility of the user-toggleable columns for storage. */
export function serializeColumnVisibility(
  visibility: ColumnVisibilityState,
  hideableIds: Set<string>,
): string {
  const toSave: ColumnVisibilityState = {};
  for (const id of hideableIds) {
    toSave[id] = visibility[id] !== false;
  }
  return JSON.stringify(toSave);
}
