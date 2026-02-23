"use client";

import { createContext, useContext, Fragment, ReactNode, useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  RowSelectionState,
  SortingState,
  ExpandedState,
  FilterFn,
  VisibilityState,
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
import { DataTableFilterBar, type FilterDef } from "./DataTableFilterBar";
import { BulkActionBar } from "@/components/bulk/BulkActionBar";
import { BulkDeleteDialog } from "@/components/bulk/BulkDeleteDialog";
import { BulkEditDialog, BulkEditField } from "@/components/bulk/BulkEditDialog";
export type { BulkEditField } from "@/components/bulk/BulkEditDialog";
export type { FilterDef } from "./DataTableFilterBar";

// Context so selection cells can read the live rowSelection state without
// relying on a closure captured in TanStack Table's memoised column model.
const RowSelectionContext = createContext<RowSelectionState>({});

// Custom filter function for multi-select filters
const multiSelectFilter: FilterFn<any> = (row, columnId, filterValue: string[]) => {
  if (!filterValue || filterValue.length === 0) return true;
  const rawValue = row.getValue(columnId);
  return filterValue.includes(String(rawValue));
};
multiSelectFilter.autoRemove = (val: string[]) => !val || val.length === 0;

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

// Reads initial filter state from URL params and sessionStorage
// Wrapped in Suspense due to useSearchParams
function DataTableFilterInit({
  filters,
  setColumnFilters,
}: {
  filters?: FilterDef[];
  setColumnFilters: (filters: ColumnFiltersState) => void;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!filters?.length) return;

    const initial: ColumnFiltersState = [];

    // 1. Check URL params first
    for (const f of filters) {
      const paramName = f.urlParamName ?? f.columnId;
      const param = searchParams.get(paramName);
      if (param) {
        initial.push({ id: f.columnId, value: param.split(',') });
      }
    }

    // 2. Fall back to sessionStorage if no URL params
    if (initial.length === 0) {
      try {
        const saved = sessionStorage.getItem(`dtf-${pathname}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          initial.push(...parsed);
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (initial.length > 0) {
      setColumnFilters(initial);
    }
  }, []); // Mount only

  return null;
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
  filters?: FilterDef[];
};

export function DataTable<T>({ data, columns, defaultPageSize, filterColumnName, defaultSortColumn, buttons, getSubRows, renderDetail, defaultExpanded, onBulkDelete, bulkEditFields, onBulkEdit, filters }: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const visibility: VisibilityState = {};
    columns.forEach((col: any) => {
      const colId = col.id ?? col.accessorKey;
      if ((col.meta as any)?.hidden) {
        visibility[colId] = false;
      }
    });
    return visibility;
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Sync column filters to URL and sessionStorage
  useEffect(() => {
    if (!filters?.length) return;

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    for (const f of filters) {
      const paramName = f.urlParamName ?? f.columnId;
      const val = columnFilters.find(cf => cf.id === f.columnId)?.value as string[] | undefined;
      if (val?.length) {
        params.set(paramName, val.join(','));
      } else {
        params.delete(paramName);
      }
    }
    const newQs = params.toString();
    const currentQs = searchParams.toString();

    // Only update URL if the query string actually changed
    if (newQs !== currentQs) {
      router.replace(newQs ? `${pathname}?${newQs}` : pathname, { scroll: false });
    }

    // Update sessionStorage
    try {
      const managedFilters = columnFilters.filter(cf => filters.some(f => f.columnId === cf.id));
      sessionStorage.setItem(`dtf-${pathname}`, JSON.stringify(managedFilters));
    } catch {
      // Ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters, filters, pathname]);

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

  const processedColumns: ColumnDef<T>[] = allColumns.map(col => {
    const colId = (col as any).id ?? (col as any).accessorKey;
    const hasFilterDef = filters?.some(f => f.columnId === colId);
    return {
      ...col,
      meta: { ...(col.meta ?? {}), _hasExplicitSize: col.size !== undefined },
      ...(hasFilterDef ? { filterFn: multiSelectFilter } : {}),
    };
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: processedColumns,
    state: {
      pagination,
      columnFilters,
      sorting,
      columnVisibility,
      ...(getSubRows || renderDetail ? { expanded } : {}),
      ...(enableRowSelection ? { rowSelection } : {}),
    },
    onColumnVisibilityChange: setColumnVisibility,
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
    <>
      <Suspense fallback={null}>
        <DataTableFilterInit filters={filters} setColumnFilters={setColumnFilters} />
      </Suspense>
      <RowSelectionContext.Provider value={rowSelection}>
      <div className="relative flex w-full items-center">
        <div className="left-0 flex items-center gap-2">
          <FilterControl table={table} filterColumnName={filterColumnName} columnFilters={columnFilters} />
          {filters?.length ? <DataTableFilterBar filters={filters} table={table} columnFilters={columnFilters} /> : null}
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
    </>
  );
}
