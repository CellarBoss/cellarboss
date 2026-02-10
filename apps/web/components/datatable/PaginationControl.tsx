"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { cn } from "@/lib/utils";
import { Table } from "@tanstack/react-table";

type PaginationControlProps = {
  table: Table<any>;
  pagination: { pageIndex: number; pageSize: number };
  pageCount: number;
};

export function PaginationControl({ table, pagination, pageCount }: PaginationControlProps) {
  const { pageIndex } = pagination
  const canPrevious = pageIndex > 0
  const canNext = pageIndex + 1 < pageCount

  return (
    <Pagination className="select-none">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => table.previousPage()}
            className={cn(
              "h-9 px-3 rounded-md border cursor-pointer",
              !canPrevious && "opacity-50 pointer-events-none"
            )}
          />
        </PaginationItem>
        <PaginationItem>
          <span className="flex items-center gap-1 rounded-md border bg-muted px-3 py-1 text-sm">
            Page <span className="font-medium">{pagination.pageIndex + 1}</span>
            <span className="text-muted-foreground">of</span>
            <span className="font-medium">{pageCount}</span>
          </span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={() => table.nextPage()}
            className={cn(
              "h-9 px-3 rounded-md border cursor-pointer",
              !canNext && "opacity-50 pointer-events-none"
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}