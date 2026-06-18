"use client";

import { Fragment, ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";

import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

import DataTableHeader from "./DataTableHeader";
import DataTableFooter from "./DataTableFooter";
import DataTableRow from "./DataTableRow";
import DataTableDetailRow from "./detail/DataTableDetailRow";
import { DataTableSearchControl } from "./DataTableSearchControl";
import {
  DataTableFilterControl,
  FilterType,
  type FilterDef,
} from "./DataTableFilterControl";
import { BulkActionBar } from "@/components/bulk/BulkActionBar";
import { BulkDeleteDialog } from "@/components/bulk/BulkDeleteDialog";
import {
  BulkEditDialog,
  BulkEditField,
} from "@/components/bulk/BulkEditDialog";
import { RowSelectionContext } from "../selection/RowSelectionContext";
import { useDataTableState } from "../hooks/useDataTableState";
import { useDataTableUrlState } from "../hooks/useDataTableUrlState";
import { useColumnVisibilityPreference } from "../hooks/useColumnVisibilityPreference";
import { useColumnOrderPreference } from "../hooks/useColumnOrderPreference";
import { useBulkActions } from "../hooks/useBulkActions";
import { processColumnsWithFilters } from "../utils/processColumns";
import { normaliseTableId } from "../utils/tablePreferences";
import { getContextRows } from "../utils/contextRowCalculations";
import { calculatePaginationMetrics } from "../utils/paginationCalculations";
import { createTableStateUpdater } from "../hooks/useDataTableState";

export type { BulkEditField } from "@/components/bulk/BulkEditDialog";
export { FilterType };
export type { FilterDef } from "./DataTableFilterControl";

type DataTableProps<T> = {
  data?: T[];
  columns: ColumnDef<T>[];
  defaultPageSize?: number;
  filterColumnName?: string;
  defaultSortColumn?: string;
  buttons?: ReactNode[];
  getSubRows?: (row: T) => T[] | undefined;
  renderDetail?: (row: T) => React.ReactNode;
  defaultExpanded?: true | Record<string, boolean>;
  onBulkDelete?: (rows: T[]) => Promise<void>;
  bulkEditFields?: BulkEditField<T>[];
  onBulkEdit?: (
    rows: T[],
    partial: Record<string, string | number>,
  ) => Promise<void>;
  filters?: FilterDef[];
  /**
   * Stable identifier for persisting per-user column visibility. Defaults to
   * the current pathname, which is sufficient when a route renders one table.
   */
  tableId?: string;
};

export function DataTable<T>({
  data,
  columns,
  defaultPageSize,
  filterColumnName,
  defaultSortColumn,
  buttons,
  getSubRows,
  renderDetail,
  defaultExpanded,
  onBulkDelete,
  bulkEditFields,
  onBulkEdit,
  filters,
  tableId,
}: DataTableProps<T>) {
  const hasExpansion = !!(getSubRows || renderDetail);
  const pathname = usePathname();
  // Normalise into a key-safe id (lowercase dotted segments) so the stored
  // preference key always passes the backend key validator, whatever the route.
  const resolvedTableId = normaliseTableId(tableId ?? pathname);

  // URL-backed state: column filters (including search), pagination, expansion
  const {
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    expanded,
    setExpanded,
  } = useDataTableUrlState({
    filters,
    filterColumnName,
    defaultPageSize,
    hasExpansion,
    defaultExpanded: defaultExpanded ?? (getSubRows ? true : {}),
  });

  // React state: sorting, row selection, dialogs
  const state = useDataTableState(defaultSortColumn);

  // Column visibility is owned by this hook, synced with per-user preference
  // storage. The page gate loads preferences first, so the saved visibility
  // applies synchronously on the first render.
  const { columnVisibility, onColumnVisibilityChange } =
    useColumnVisibilityPreference({
      tableId: resolvedTableId,
      columns,
    });

  // Column order is owned by this hook (content columns only), synced with
  // per-user preference storage the same way as visibility.
  const { order: contentColumnOrder, setOrder: setContentColumnOrder } =
    useColumnOrderPreference({
      tableId: resolvedTableId,
      columns,
    });

  // Prepare data
  const displayData = data ?? [];
  const enableRowSelection =
    onBulkDelete !== undefined || onBulkEdit !== undefined;

  // Full leaf order handed to the table: the fixed selection column is pinned
  // first, then the user-ordered content columns. Any leaf columns not listed
  // here (suppressed / label-less action columns) keep their definition order
  // appended after, per TanStack's column ordering behaviour.
  const columnOrder = useMemo(
    () => [...(enableRowSelection ? ["select"] : []), ...contentColumnOrder],
    [enableRowSelection, contentColumnOrder],
  );

  // Process columns with selection and filters
  const processedColumns = processColumnsWithFilters(
    columns,
    enableRowSelection,
    filters,
  );

  // Create table instance
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: displayData,
    columns: processedColumns,
    getRowId: (row) => String((row as Record<string, unknown>).id),
    state: {
      pagination,
      columnFilters,
      sorting: state.sorting,
      columnVisibility,
      columnOrder,
      ...(hasExpansion ? { expanded } : {}),
      ...(enableRowSelection ? { rowSelection: state.rowSelection } : {}),
    },
    onColumnVisibilityChange,
    ...(enableRowSelection
      ? {
          enableRowSelection: true,
          enableSubRowSelection: false,
          onRowSelectionChange: createTableStateUpdater(state.setRowSelection),
        }
      : {}),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: createTableStateUpdater(setColumnFilters),
    onSortingChange: createTableStateUpdater(state.setSorting),
    ...(getSubRows
      ? {
          getSubRows,
          getExpandedRowModel: getExpandedRowModel(),
          onExpandedChange: createTableStateUpdater(setExpanded),
          filterFromLeafRows: true,
        }
      : {}),
    ...(renderDetail
      ? {
          onExpandedChange: createTableStateUpdater(setExpanded),
        }
      : {}),
  });

  // Get pagination metrics (pageCount is hierarchy-aware, hence the custom calc)
  const { pageCount } = calculatePaginationMetrics(
    table,
    pagination,
    getSubRows,
  );

  // Get context rows for hierarchical data
  const pageRows = table.getRowModel().rows;
  const contextRows = getContextRows(pageRows, getSubRows);

  // Get selected rows and bulk action handlers
  const selectedRows = table
    .getSelectedRowModel()
    .flatRows.map((r: Row<T>) => r.original);
  const selectedCount = selectedRows.length;
  const bulkActions = useBulkActions(
    selectedRows,
    onBulkDelete,
    onBulkEdit,
    state.setRowSelection,
    state.setEditDialogOpen,
  );

  return (
    <RowSelectionContext.Provider value={state.rowSelection}>
      <div className="relative flex w-full flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <DataTableSearchControl
            table={table}
            filterColumnName={filterColumnName}
            columnFilters={columnFilters}
          />
          {filters?.length ? (
            <DataTableFilterControl
              filters={filters}
              table={table}
              columnFilters={columnFilters}
            />
          ) : null}
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {buttons?.map((button, index) => (
            <Fragment key={index}>{button}</Fragment>
          ))}
        </div>
      </div>
      <Table>
        <DataTableHeader table={table} sorting={state.sorting} />
        <TableBody>
          {table.getRowCount() === 0 && (
            <TableRow>
              <TableCell
                colSpan={processedColumns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
          {contextRows.map((row) => (
            <DataTableRow
              key={`context-${row.id}`}
              row={row}
              isExpanded={false}
              canExpand={false}
              isContext={true}
            />
          ))}
          {pageRows.map((row) => (
            <Fragment key={row.id}>
              <DataTableRow
                row={row}
                isExpanded={row.getIsExpanded()}
                canExpand={row.getCanExpand() || !!renderDetail}
              />
              {renderDetail && row.getIsExpanded() && (
                <DataTableDetailRow
                  row={row}
                  columnSpan={processedColumns.length}
                  renderDetail={renderDetail}
                />
              )}
            </Fragment>
          ))}
        </TableBody>
        <DataTableFooter
          table={table}
          pageCount={pageCount}
          setPagination={setPagination}
          columnOrder={contentColumnOrder}
          onColumnOrderChange={setContentColumnOrder}
        />
      </Table>
      {enableRowSelection && (
        <>
          <BulkActionBar
            selectedCount={selectedCount}
            onClear={() => state.setRowSelection({})}
            onDelete={
              onBulkDelete ? () => state.setDeleteDialogOpen(true) : undefined
            }
            onEdit={
              onBulkEdit ? () => state.setEditDialogOpen(true) : undefined
            }
          />
          {onBulkDelete && (
            <BulkDeleteDialog
              open={state.deleteDialogOpen}
              onOpenChange={state.setDeleteDialogOpen}
              selectedCount={selectedCount}
              onConfirm={bulkActions.handleBulkDeleteConfirm}
            />
          )}
          {bulkEditFields && onBulkEdit && (
            <BulkEditDialog<T>
              open={state.editDialogOpen}
              onOpenChange={state.setEditDialogOpen}
              selectedCount={selectedCount}
              fields={bulkEditFields}
              onSave={bulkActions.handleBulkEditSave}
            />
          )}
        </>
      )}
    </RowSelectionContext.Provider>
  );
}
