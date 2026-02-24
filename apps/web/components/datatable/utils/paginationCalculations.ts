import { Table as TableInstance } from "@tanstack/react-table";
import { PaginationState } from "@tanstack/react-table";

export interface PaginationMetrics {
  pageSize: number;
  paginationRowCount: number;
  pageCount: number;
}

export function calculatePaginationMetrics<T>(
  table: TableInstance<T>,
  pagination: PaginationState,
  getSubRows?: (row: T) => T[] | undefined
): PaginationMetrics {
  const pageSize = table.getState().pagination.pageSize;
  const paginationRowCount = getSubRows
    ? table.getExpandedRowModel().rows.length
    : table.getFilteredRowModel().rows.length;
  const pageCount = Math.ceil(paginationRowCount / pagination.pageSize);

  return { pageSize, paginationRowCount, pageCount };
}
