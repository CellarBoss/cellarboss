"use client";

import { Table as TableInstance } from "@tanstack/react-table";
import type { PaginationState } from "@tanstack/react-table";

import { TableCell, TableFooter, TableRow } from "@/components/ui/table";

import { PaginationControl } from "./PaginationControl";
import { PaginationSelector } from "./PaginationSelector";
import { DataTableColumnsControl } from "./DataTableColumnsControl";

type DataTableFooterProps<T> = {
  table: TableInstance<T>;
  // pageCount uses a custom (hierarchy-aware) calc, and pagination is controlled
  // via nuqs rather than the table's onPaginationChange — so these can't be read
  // off the table and stay as props.
  pageCount: number;
  setPagination: (
    newPag: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  // Content column order (selection column excluded) and its setter, for the
  // configure-table drag-and-drop reordering control.
  columnOrder: string[];
  onColumnOrderChange: (next: string[]) => void;
};

export default function DataTableFooter<T>({
  table,
  pageCount,
  setPagination,
  columnOrder,
  onColumnOrderChange,
}: DataTableFooterProps<T>) {
  "use no memo"; // reads live pagination & visible-column state from the table

  const pagination = table.getState().pagination;
  const colSpan = table.getVisibleLeafColumns().length;

  return (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={colSpan}>
          <div className="flex w-full flex-col items-center gap-2 sm:relative sm:flex-row">
            <div className="order-3 sm:order-none">
              <DataTableColumnsControl
                table={table}
                columnOrder={columnOrder}
                onColumnOrderChange={onColumnOrderChange}
              />
            </div>
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
                pageSize={pagination.pageSize}
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
