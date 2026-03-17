"use client";

import { ColumnDef } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";

import { TableCell, TableFooter, TableRow } from "@/components/ui/table";

import { PaginationControl } from "./PaginationControl";
import { PaginationSelector } from "./PaginationSelector";

type DataTableFooterProps<T> = {
  columns: ColumnDef<T>[];
  pagination: PaginationState;
  pageCount: number;
  pageSize: number;
  setPagination: (
    newPag: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
};

export default function DataTableFooter<T>({
  columns,
  pagination,
  pageCount,
  pageSize,
  setPagination,
}: DataTableFooterProps<T>) {
  return (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={columns.length}>
          <div className="flex w-full flex-col items-center gap-2 sm:relative sm:flex-row">
            <div className="order-1 sm:absolute sm:left-1/2 sm:-translate-x-1/2">
              <PaginationControl
                pagination={pagination}
                pageCount={pageCount}
                onPrevious={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: p.pageIndex - 1,
                  }))
                }
                onNext={() =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: p.pageIndex + 1,
                  }))
                }
              />
            </div>
            <div className="order-2 flex items-center gap-2 sm:ml-auto">
              <PaginationSelector
                pageSize={pageSize}
                onPageSizeChange={(size) =>
                  setPagination((p) => ({
                    ...p,
                    pageIndex: 0,
                    pageSize: size,
                  }))
                }
              />
            </div>
          </div>
        </TableCell>
      </TableRow>
    </TableFooter>
  );
}
