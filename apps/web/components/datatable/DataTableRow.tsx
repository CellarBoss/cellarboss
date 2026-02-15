"use client";

import {
  flexRender,
  Row
} from "@tanstack/react-table";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table"

import { ChevronRight, ChevronDown } from "lucide-react";

type DataTableRowProps<T> = {
  row: Row<T>;
  getSubRows?: (row: T) => T[] | undefined;
};

export default function DataTableRow<T>({ row, getSubRows }: DataTableRowProps<T>) {
  return (
    <TableRow key={row.id} className="group border-b border-default">
      {row.getVisibleCells().map((cell, cellIndex) => (
        <TableCell
          key={cell.id}
          className={"border p-2 bg-table-row group-hover:bg-table-row-hover"}
          style={
            cellIndex === 0 && getSubRows
              ? { paddingLeft: `${row.depth * 24 + 8}px` }
              : undefined
          }
        >
          {cellIndex === 0 && getSubRows ? (
            <div className="flex items-center gap-1">
              {row.getCanExpand() ? (
                <button
                  onClick={row.getToggleExpandedHandler()}
                  className="cursor-pointer p-0.5 rounded hover:bg-muted"
                  aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
                >
                  {row.getIsExpanded() ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span className="w-5" />
              )}
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );

}