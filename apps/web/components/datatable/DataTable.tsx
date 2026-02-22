"use client";

import { createContext, useContext, Fragment, ReactNode, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  RowSelectionState,
  SortingState,
  ExpandedState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
  Table as TableInstance,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

import { Checkbox } from "@/components/ui/checkbox";
import DataTableHeader from "./DataTableHeader";
import DataTableFooter from "./DataTableFooter";
import DataTableRow from "./DataTableRow";
import DataTableDetailRow from "./DataTableDetailRow";
import { FilterControl } from "./FilterControl";
import { BulkActionBar } from "@/components/bulk/BulkActionBar";
import { BulkDeleteDialog } from "@/components/bulk/BulkDeleteDialog";
import { BulkEditDialog, BulkEditField } from "@/components/bulk/BulkEditDialog";
export type { BulkEditField } from "@/components/bulk/BulkEditDialog";

// Context so selection cells can read the live rowSelection state without
// relying on a closure captured in TanStack Table's memoised column model.
const RowSelectionContext = createContext<RowSelectionState>({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectAllCheckbox({ table }: { table: TableInstance<any> }) {
  const rowSelection = useContext(RowSelectionContext);
  const pageRows = table.getRowModel().rows;
  const allSelected = pageRows.length > 0 && pageRows.every(r => !!rowSelection[r.id]);
  return (
    <Checkbox
      checked={allSelected}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      aria-label="Select all"
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SelectionCell({ row }: { row: Row<any> }) {
  const rowSelection = useContext(RowSelectionContext);
  return (
    <Checkbox
      checked={!!rowSelection[row.id]}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
      aria-label="Select row"
      onClick={(e) => e.stopPropagation()}
    />
  );
}

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
};

export function DataTable<T>({ data, columns, defaultPageSize, filterColumnName, defaultSortColumn, buttons, getSubRows, renderDetail, defaultExpanded, onBulkDelete, bulkEditFields, onBulkEdit }: DataTableProps<T>) {
  if (defaultPageSize === undefined) {
    defaultPageSize = 20;
  }

  const enableRowSelection = onBulkDelete !== undefined || onBulkEdit !== undefined;

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )

  const [sorting, setSorting] = useState<SortingState>(
    defaultSortColumn ? [{ id: defaultSortColumn, desc: false }] : []
  )

  const [expanded, setExpanded] = useState<ExpandedState>(
    defaultExpanded ?? (getSubRows ? true : {})
  )

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (data === undefined) {
    data = [];
  }

  const selectionColumn: ColumnDef<T> = {
    id: "select",
    header: ({ table }) => <div className="flex gap-1 justify-center mx-5"><SelectAllCheckbox table={table} /></div>,
    cell: ({ row }) => <div className="flex gap-1 justify-center mx-5"><SelectionCell row={row} /></div>,
    enableSorting: false,
    size: 50,
  };

  const allColumns = enableRowSelection ? [selectionColumn, ...columns] : columns;

  const processedColumns: ColumnDef<T>[] = allColumns.map(col => ({
    ...col,
    meta: { ...(col.meta ?? {}), _hasExplicitSize: col.size !== undefined },
  }));

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: processedColumns,
    state: {
      pagination,
      columnFilters,
      sorting,
      ...(getSubRows || renderDetail ? { expanded } : {}),
      ...(enableRowSelection ? { rowSelection } : {}),
    },
    ...(enableRowSelection ? {
      enableRowSelection: true,
      onRowSelectionChange: setRowSelection,
    } : {}),
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    ...(getSubRows
      ? {
        getSubRows,
        getExpandedRowModel: getExpandedRowModel(),
        onExpandedChange: setExpanded,
        filterFromLeafRows: true,
      }
      : {}),
    ...(renderDetail
      ? { onExpandedChange: setExpanded }
      : {}),
  });

  const selectedRows = table.getSelectedRowModel().rows.map(r => r.original);
  const selectedCount = selectedRows.length;

  async function handleBulkDeleteConfirm() {
    await onBulkDelete!(selectedRows);
    setRowSelection({});
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleBulkEditSave(partial: Record<string, any>) {
    await onBulkEdit!(selectedRows, partial);
    setRowSelection({});
    setEditDialogOpen(false);
  }

  const { pageSize } = table.getState().pagination;
  const paginationRowCount = getSubRows
    ? table.getExpandedRowModel().rows.length
    : table.getFilteredRowModel().rows.length;
  const pageCount = Math.ceil(paginationRowCount / pagination.pageSize)

  const pageRows = table.getRowModel().rows;
  const contextRows: Row<T>[] = [];
  if (getSubRows) {
    const pageRowIds = new Set(pageRows.map(r => r.id));
    const seenContextIds = new Set<string>();
    for (const row of pageRows) {
      for (const ancestor of row.getParentRows()) {
        if (!pageRowIds.has(ancestor.id) && !seenContextIds.has(ancestor.id)) {
          contextRows.push(ancestor);
          seenContextIds.add(ancestor.id);
        }
      }
    }
  }

  return (
    <RowSelectionContext.Provider value={rowSelection}>
      <div className="relative flex w-full items-center">
        <div className="left-0 w-[50%]">
          <FilterControl table={table} filterColumnName={filterColumnName} columnFilters={columnFilters} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {buttons?.map((button, index) => (
            <Fragment key={index}>
              {button}
            </Fragment>
          ))}
        </div>
      </div>
      <Table>
        <DataTableHeader table={table} sorting={sorting} />
        <TableBody>
          {table.getRowCount() === 0 && (
            <TableRow>
              <TableCell colSpan={processedColumns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
          {contextRows.map((row) => (
            <DataTableRow key={`context-${row.id}`} row={row} isExpanded={false} canExpand={false} isContext={true} />
          ))}
          {pageRows.map((row) => (
            <Fragment key={row.id}>
              <DataTableRow row={row} isExpanded={row.getIsExpanded()} canExpand={row.getCanExpand() || !!renderDetail} />
              {renderDetail && row.getIsExpanded() && (
                <DataTableDetailRow row={row} columnSpan={processedColumns.length} renderDetail={renderDetail} />
              )}
            </Fragment>
          ))}
        </TableBody>
        <DataTableFooter columns={processedColumns} pagination={pagination} pageCount={pageCount} pageSize={pageSize} table={table} />
      </Table>
      {enableRowSelection && (
        <>
          <BulkActionBar
            selectedCount={selectedCount}
            onClear={() => setRowSelection({})}
            onDelete={onBulkDelete ? () => setDeleteDialogOpen(true) : undefined}
            onEdit={onBulkEdit ? () => setEditDialogOpen(true) : undefined}
          />
          {onBulkDelete && (
            <BulkDeleteDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              selectedCount={selectedCount}
              onConfirm={handleBulkDeleteConfirm}
            />
          )}
          {bulkEditFields && onBulkEdit && (
            <BulkEditDialog<T>
              open={editDialogOpen}
              onOpenChange={setEditDialogOpen}
              selectedCount={selectedCount}
              fields={bulkEditFields}
              onSave={handleBulkEditSave}
            />
          )}
        </>
      )}
    </RowSelectionContext.Provider>
  );
}
