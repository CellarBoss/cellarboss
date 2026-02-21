"use client";

import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  flexRender,
  SortingState,
  Table
} from "@tanstack/react-table";

import { ArrowUp, ArrowDown } from "lucide-react";

type DataTableHeaderProps<T> = {
  table: Table<T>;
  sorting: SortingState;
};

export default function DataTableHeader<T>({ table, sorting }: DataTableHeaderProps<T>) {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup: any) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header: any) => {
            const sortDirection = sorting.find(s => s.id === header.column.id);
            return (
              <TableHead
                key={header.id}
                onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                className={"bg-table-header " + ((header.column.columnDef.meta as any)?._hasExplicitSize ? `w-[${header.column.getSize()}px]` : '')}>
                <div className={"flex items-center gap-1 select-none " + (header.column.getCanSort() ? 'cursor-pointer' : '')}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {sortDirection && (
                    sortDirection.desc
                      ? <ArrowDown className="w-4 h-4" />
                      : <ArrowUp className="w-4 h-4" />
                  )}
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </TableHeader>
  );
}