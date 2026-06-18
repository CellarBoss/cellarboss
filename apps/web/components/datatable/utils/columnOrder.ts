import type { ColumnDef } from "@tanstack/react-table";
import { tablePreferenceKey } from "./tablePreferences";

/**
 * Preference key under which a table's column order is stored
 * (`datatable.<tableId>.columns.order`).
 */
export function columnOrderPreferenceKey(tableId: string): string {
  return tablePreferenceKey(tableId, "columns", "order");
}

function columnId<T>(col: ColumnDef<T>): string | undefined {
  return (col as any).id ?? (col as any).accessorKey;
}

/**
 * Human-readable label for a column in the configure menu, or null when the
 * column shouldn't appear there (suppressed, or an action/selection column with
 * no usable header). The orderable set is defined by this so the columns the
 * user can drag exactly match the menu rows.
 */
export function columnMenuLabel<T>(col: ColumnDef<T>): string | null {
  const meta = col.meta;
  if (meta?.isSuppressed) return null;
  if (meta?.label) return meta.label;
  const header = col.header;
  if (typeof header === "string" && header.trim() !== "") return header;
  return null;
}

/**
 * Content column ids the user is allowed to reorder, in definition order.
 * Excludes suppressed and label-less columns (which never appear in the menu).
 */
export function getOrderableColumnIds<T>(columns: ColumnDef<T>[]): string[] {
  const ids: string[] = [];
  columns.forEach((col) => {
    const id = columnId(col);
    if (!id) return;
    if (columnMenuLabel(col) === null) return;
    ids.push(id);
  });
  return ids;
}

/** Parse a stored preference value into an order array, ignoring malformed data. */
export function parseSavedOrder(raw: string | undefined): string[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return null;
  }
}

/**
 * Effective content order: the saved order filtered to the columns that still
 * exist and are orderable, with any new orderable columns appended in their
 * default position. Stale or duplicate saved ids are dropped so a saved order
 * can never resurrect or duplicate a column.
 */
export function mergeSavedOrder(
  orderableIds: string[],
  saved: string[] | null,
): string[] {
  if (!saved) return orderableIds;
  const orderable = new Set(orderableIds);
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const id of saved) {
    if (orderable.has(id) && !seen.has(id)) {
      merged.push(id);
      seen.add(id);
    }
  }
  // Append orderable columns absent from the saved order (newly added columns),
  // preserving their default relative order.
  for (const id of orderableIds) {
    if (!seen.has(id)) merged.push(id);
  }
  return merged;
}

/** Serialise a content order for storage. */
export function serializeColumnOrder(order: string[]): string {
  return JSON.stringify(order);
}
