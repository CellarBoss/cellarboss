"use client";

import { Fragment, ReactNode, useState } from "react";
import { useRouter } from 'next/navigation';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { PaginationControl } from "@/components/datatable/PaginationControl";
import { PaginationSelector } from "./PaginationSelector";
import { FilterControl } from "./FilterControl";
import { AddButton } from "../buttons/AddButton";
import { ArrowUp, ArrowDown } from "lucide-react";


type DataTableProps<T> = {
  data?: T[];
  columns: ColumnDef<T>[];
  defaultPageSize?: number;
  filterColumnName?: string;
  defaultSortColumn?: string;
  buttons?: ReactNode[];
};

export function DataTable<T>({ data, columns, defaultPageSize, filterColumnName, defaultSortColumn, buttons }: DataTableProps<T>) {
  const router = useRouter();

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

  if(data === undefined) {
    data = [];
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      columnFilters,
      sorting,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
  });

  const { pageSize } = table.getState().pagination;
  const filteredRows = table.getFilteredRowModel().rows
  const pageCount = Math.ceil(filteredRows.length / pagination.pageSize)

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
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                  className={"bg-table-header " + (header.column.id === 'options' ? 'w-[100px]' : '')}>
                  <div className={"flex items-center gap-1 select-none " + (header.column.getCanSort() ? 'cursor-pointer' : '')}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <ArrowUp className="w-4 h-4" />,
                      desc: <ArrowDown className="w-4 h-4" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowCount() === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className="group border-b border-default">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={"border p-2 bg-table-row group-hover:bg-table-row-hover"}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length}>
              <div className="relative flex w-full items-center">
                <div className="absolute left-1/2 -translate-x-1/2">
                  <PaginationControl table={table} pagination={pagination} pageCount={pageCount} />
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <PaginationSelector table={table} pageSize={pageSize} />
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
}
