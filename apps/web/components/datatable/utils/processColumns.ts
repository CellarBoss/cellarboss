import { ColumnDef } from "@tanstack/react-table";
import type { FilterDef } from "../components/DataTableFilterControl";
import { multiSelectFilter } from "../filters/multiSelectFilter";
import { createSelectionColumn } from "../components/selection/selectionColumn";

export function processColumnsWithFilters<T>(
  columns: ColumnDef<T>[],
  enableRowSelection: boolean,
  filters?: FilterDef[]
): ColumnDef<T>[] {
  const selectionColumn = enableRowSelection ? [createSelectionColumn<T>()] : [];
  const allColumns = [...selectionColumn, ...columns];

  return allColumns.map(col => {
    const colId = (col as any).id ?? (col as any).accessorKey;
    const hasFilterDef = filters?.some(f => f.columnId === colId);
    return {
      ...col,
      meta: { ...(col.meta ?? {}), _hasExplicitSize: col.size !== undefined },
      ...(hasFilterDef ? { filterFn: multiSelectFilter } : {}),
    };
  });
}
