import type { Column, ColumnDef, VisibilityState } from "@tanstack/react-table";

export type DataTableColumnMeta = {
  label?: string;
  hidden?: boolean;
  isSuppressed?: boolean;
  defaultVisible?: boolean;
  isHideable?: boolean;
  _hasExplicitSize?: boolean;
};

type ColumnWithIdentity<T> = ColumnDef<T> & {
  id?: string;
  accessorKey?: string;
};

export function getColumnId<T>(column: ColumnDef<T>): string | undefined {
  const candidate = column as ColumnWithIdentity<T>;
  return candidate.id ?? candidate.accessorKey;
}

export function getColumnMeta<T>(
  column: ColumnDef<T>,
): DataTableColumnMeta | undefined {
  return column.meta as DataTableColumnMeta | undefined;
}

export function getDefaultColumnVisibility<T>(
  columns: ColumnDef<T>[],
): VisibilityState {
  const visibility: VisibilityState = {};

  columns.forEach((column) => {
    const id = getColumnId(column);
    if (!id) return;

    const meta = getColumnMeta(column);
    if (meta?.isSuppressed || meta?.hidden || meta?.defaultVisible === false) {
      visibility[id] = false;
    }

    if (meta?.isHideable === false) {
      delete visibility[id];
    }
  });

  return visibility;
}

export function mergeColumnVisibility<T>(
  columns: ColumnDef<T>[],
  savedVisibility?: Record<string, boolean>,
): VisibilityState {
  const visibility = getDefaultColumnVisibility(columns);
  const columnIds = new Set(columns.map(getColumnId).filter(Boolean));

  Object.entries(savedVisibility ?? {}).forEach(([id, visible]) => {
    if (!columnIds.has(id)) return;

    const column = columns.find((candidate) => getColumnId(candidate) === id);
    const meta = column ? getColumnMeta(column) : undefined;
    if (meta?.isSuppressed || meta?.isHideable === false) return;

    visibility[id] = visible;
  });

  return visibility;
}

export function toPersistedColumnVisibility<T>(
  columns: ColumnDef<T>[],
  visibility: VisibilityState,
): Record<string, boolean> {
  const persisted: Record<string, boolean> = {};

  columns.forEach((column) => {
    const id = getColumnId(column);
    if (!id) return;

    const meta = getColumnMeta(column);
    if (meta?.isSuppressed || meta?.isHideable === false) return;

    persisted[id] = visibility[id] ?? true;
  });

  return persisted;
}

export function isColumnVisibilityPreference(
  value: unknown,
): value is Record<string, boolean> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((visible) => typeof visible === "boolean");
}

export function isColumnSuppressed<T>(column: Column<T, unknown>) {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  return meta?.isSuppressed === true || column.id === "select";
}

export function isColumnHideable<T>(column: Column<T, unknown>) {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  return (
    !isColumnSuppressed(column) &&
    meta?.isHideable !== false &&
    column.getCanHide()
  );
}

export function getColumnLabel<T>(column: Column<T, unknown>) {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  if (meta?.label) return meta.label;
  if (typeof column.columnDef.header === "string")
    return column.columnDef.header;
  return column.id;
}
