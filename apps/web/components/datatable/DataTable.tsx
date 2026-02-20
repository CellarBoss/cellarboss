"use client";

import { Fragment, ReactNode, useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  ExpandedState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  useReactTable,
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
};

export function DataTable<T>({ data, columns, defaultPageSize, filterColumnName, defaultSortColumn, buttons, getSubRows, renderDetail, defaultExpanded }: DataTableProps<T>) {
  if (defaultPageSize === undefined) {
    defaultPageSize = 20;
  }

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

  if (data === undefined) {
    data = [];
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
      sorting,
      ...(getSubRows || renderDetail ? { expanded } : {}),
    },
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
              <TableCell colSpan={columns.length} className="h-24 text-center">
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
                <DataTableDetailRow row={row} columnSpan={columns.length} renderDetail={renderDetail} />
              )}
            </Fragment>
          ))}
        </TableBody>
        <DataTableFooter columns={columns} pagination={pagination} pageCount={pageCount} pageSize={pageSize} table={table} />
      </Table>
    </>
  );
}
