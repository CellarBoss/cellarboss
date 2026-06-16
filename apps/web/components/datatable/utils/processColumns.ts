import { ColumnDef } from "@tanstack/react-table";
import type { FilterDef } from "../components/DataTableFilterControl";
import { FilterType } from "../components/DataTableFilterControl";
import { multiSelectFilter } from "../filters/multiSelectFilter";
import { rangeFilter } from "../filters/rangeFilter";
import { createSelectionColumn } from "../components/selection/selectionColumn";

export function processColumnsWithFilters<T>(
  columns: ColumnDef<T>[],
  enableRowSelection: boolean,
  filters?: FilterDef[],
): ColumnDef<T>[] {
  const selectionColumn = enableRowSelection
    ? [createSelectionColumn<T>()]
    : [];
  const allColumns = [...selectionColumn, ...columns];

  return allColumns.map((col) => {
    const colId = (col as any).id ?? (col as any).accessorKey;
    const filterDef = filters?.find((f) => f.columnId === colId);
    const filterFn = filterDef
      ? filterDef.type === FilterType.Range
        ? rangeFilter
        : multiSelectFilter
      : undefined;
    const meta = col.meta;
    // Suppressed columns and columns explicitly marked non-hideable cannot be
    // toggled by the user.
    const canHide = meta?.isHideable !== false && !meta?.isSuppressed;
    return {
      ...col,
      ...(canHide ? {} : { enableHiding: false }),
      meta: { ...(meta ?? {}), _hasExplicitSize: col.size !== undefined },
      ...(filterFn && !col.filterFn ? { filterFn } : {}),
    };
  });
}
