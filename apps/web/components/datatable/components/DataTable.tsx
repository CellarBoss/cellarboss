"use client";

import { Fragment, ReactNode } from "react";
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

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

import DataTableHeader from "./DataTableHeader";
import DataTableFooter from "./DataTableFooter";
import DataTableRow from "./DataTableRow";
import DataTableDetailRow from "./DataTableDetailRow";
import { FilterControl } from "./FilterControl";
import { DataTableFilterBar, type FilterDef } from "./DataTableFilterBar";
import { BulkActionBar } from "@/components/bulk/BulkActionBar";
import { BulkDeleteDialog } from "@/components/bulk/BulkDeleteDialog";
import { BulkEditDialog, BulkEditField } from "@/components/bulk/BulkEditDialog";
import { DataTableFilterInit } from "./filters/DataTableFilterInit";
import { RowSelectionContext } from "../selection/RowSelectionContext";
import { useDataTableState } from "../hooks/useDataTableState";
import { useFilterInitialization } from "../hooks/useFilterInitialization";
import { useFilterSync } from "../hooks/useFilterSync";
import { useBulkActions } from "../hooks/useBulkActions";
import { processColumnsWithFilters } from "../utils/processColumns";
import { getContextRows } from "../utils/contextRowCalculations";
import { calculatePaginationMetrics } from "../utils/paginationCalculations";
import { createTableStateUpdater } from "../hooks/useDataTableState";

export type { BulkEditField } from "@/components/bulk/BulkEditDialog";
export type { FilterDef } from "./DataTableFilterBar";

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
  onBulkEdit?: (rows: T[], partial: Record<string, string | number>) => Promise<void>;
  filters?: FilterDef[];
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
}: DataTableProps<T>) {
  const pathname = usePathname();

  // Initialize state
  const state = useDataTableState(
    columns,
    defaultPageSize,
    defaultSortColumn,
    defaultExpanded,
    getSubRows
  );

  // Sync filters with URL and sessionStorage
  useFilterInitialization(filters, state.setColumnFilters);
  useFilterSync(state.columnFilters, filters, pathname);

  // Prepare data
  const displayData = data ?? [];
  const enableRowSelection = onBulkDelete !== undefined || onBulkEdit !== undefined;

  // Process columns with selection and filters
  const processedColumns = processColumnsWithFilters(
    columns,
    enableRowSelection,
    filters
  );

  // Create table instance
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: displayData,
    columns: processedColumns,
    state: {
      pagination: state.pagination,
      columnFilters: state.columnFilters,
      sorting: state.sorting,
      columnVisibility: state.columnVisibility,
      ...(getSubRows || renderDetail ? { expanded: state.expanded } : {}),
      ...(enableRowSelection ? { rowSelection: state.rowSelection } : {}),
    },
    onColumnVisibilityChange: createTableStateUpdater(state.setColumnVisibility),
    ...(enableRowSelection ? {
      enableRowSelection: true,
      onRowSelectionChange: createTableStateUpdater(state.setRowSelection),
    } : {}),
    onPaginationChange: createTableStateUpdater(state.setPagination),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: createTableStateUpdater(state.setColumnFilters),
    onSortingChange: createTableStateUpdater(state.setSorting),
    ...(getSubRows
      ? {
        getSubRows,
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: createTableStateUpdater(state.setExpanded),
        filterFromLeafRows: true,
      }
      : {}),
    ...(renderDetail
      ? {
        onExpandedChange: createTableStateUpdater(state.setExpanded),
      }
      : {}),
  });

  // Get pagination metrics
  const { pageSize, pageCount } = calculatePaginationMetrics(
    table,
    state.pagination,
    getSubRows
  );

  // Get context rows for hierarchical data
  const pageRows = table.getRowModel().rows;
  const contextRows = getContextRows(pageRows, getSubRows);

  // Get selected rows and bulk action handlers
  const selectedRows = table.getSelectedRowModel().rows.map((r: Row<T>) => r.original);
  const selectedCount = selectedRows.length;
  const bulkActions = useBulkActions(
    selectedRows,
    onBulkDelete,
    onBulkEdit,
    state.setRowSelection,
    state.setEditDialogOpen
  );

  return (
    <>
      <DataTableFilterInit filters={filters} setColumnFilters={state.setColumnFilters} />
      <RowSelectionContext.Provider value={state.rowSelection}>
        <div className="relative flex w-full items-center">
          <div className="left-0 flex items-center gap-2">
            <FilterControl
              table={table}
              filterColumnName={filterColumnName}
              columnFilters={state.columnFilters}
            />
            {filters?.length ? (
              <DataTableFilterBar
                filters={filters}
                table={table}
                columnFilters={state.columnFilters}
              />
            ) : null}
          </div>
          <div className="ml-auto flex items-center gap-2">
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
                <TableCell colSpan={processedColumns.length} className="h-24 text-center">
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
            columns={processedColumns}
            pagination={state.pagination}
            pageCount={pageCount}
            pageSize={pageSize}
            table={table}
          />
        </Table>
        {enableRowSelection && (
          <>
            <BulkActionBar
              selectedCount={selectedCount}
              onClear={() => state.setRowSelection({})}
              onDelete={onBulkDelete ? () => state.setDeleteDialogOpen(true) : undefined}
              onEdit={onBulkEdit ? () => state.setEditDialogOpen(true) : undefined}
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
    </>
  );
}
