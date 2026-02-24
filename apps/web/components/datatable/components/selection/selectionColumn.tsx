"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SelectAllCheckbox, SelectionCell } from "./SelectionComponents";

export function createSelectionColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex gap-1 justify-center mx-5">
        <SelectAllCheckbox table={table} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex gap-1 justify-center mx-5">
        <SelectionCell row={row} />
      </div>
    ),
    enableSorting: false,
    size: 50,
  };
}
