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
  isExpanded: boolean;
  canExpand: boolean;
};

export default function DataTableRow<T>({ row, isExpanded, canExpand }: DataTableRowProps<T>) {
  return (
    <TableRow key={row.id} className="group border-b border-default">
      {row.getVisibleCells().map((cell, cellIndex) => (
        <TableCell
          key={cell.id}
          className={"border p-2 bg-table-row group-hover:bg-table-row-hover"}
          style={
            cellIndex === 0 && (canExpand || row.depth > 0)
              ? { paddingLeft: `${row.depth * 24 + 8}px` }
              : undefined
          }
        >
          {cellIndex === 0 && (canExpand || row.depth > 0) ? (
            <div className="flex items-center gap-1">
              {canExpand ? (
                <button
                  onClick={() => row.toggleExpanded()}
                  className="cursor-pointer p-0.5 rounded hover:bg-muted"
                  aria-label={isExpanded ? "Collapse row" : "Expand row"}
                >
                  {isExpanded ? (
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