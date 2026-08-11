"use client";

import type { RowData } from "@tanstack/react-table";
import type { AppColumnDef } from "../../tableFeatures";
import { SelectAllCheckbox, SelectionCell } from "./SelectionComponents";

export function createSelectionColumn<T extends RowData>(): AppColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex gap-1 justify-center mx-5">
        <SelectAllCheckbox<T> table={table} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex gap-1 justify-center mx-5">
        <SelectionCell<T> row={row} />
      </div>
    ),
    enableSorting: false,
    size: 50,
  };
}
