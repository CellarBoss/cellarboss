import type { PaginationState, RowData } from "@tanstack/react-table";
import type { AppTable } from "../tableFeatures";

export interface PaginationMetrics {
  pageSize: number;
  paginationRowCount: number;
  pageCount: number;
}

export function calculatePaginationMetrics<T extends RowData>(
  table: AppTable<T>,
  pagination: PaginationState,
  getSubRows?: (row: T) => T[] | undefined,
): PaginationMetrics {
  const pageSize = table.state.pagination.pageSize;
  const paginationRowCount = getSubRows
    ? table.getExpandedRowModel().rows.length
    : table.getFilteredRowModel().rows.length;
  const pageCount = Math.ceil(paginationRowCount / pagination.pageSize);

  return { pageSize, paginationRowCount, pageCount };
}
