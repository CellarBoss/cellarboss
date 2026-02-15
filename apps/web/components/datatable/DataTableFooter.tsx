"use client";

import {
  ColumnDef,
  Table
} from "@tanstack/react-table";

import {
  TableCell,
  TableFooter,
  TableRow,
} from "@/components/ui/table"

import { PaginationControl } from "@/components/datatable/PaginationControl";
import { PaginationSelector } from "./PaginationSelector";

type DataTableFooterProps<T> = {
  columns: ColumnDef<T>[];
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  pageCount: number;
  pageSize: number;
  table: Table<T>;
};

export default function DataTableFooter<T>({ columns, pagination, pageCount, pageSize, table }: DataTableFooterProps<T>) {
  return (
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
  );
}