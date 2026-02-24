"use client";

import { useContext } from "react";
import { Row, Table as TableInstance } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { RowSelectionContext } from "../../selection/RowSelectionContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SelectAllCheckbox({ table }: { table: TableInstance<any> }) {
  const rowSelection = useContext(RowSelectionContext);
  const pageRows = table.getRowModel().rows;
  const allSelected =
    pageRows.length > 0 && pageRows.every((r) => !!rowSelection[r.id]);
  return (
    <Checkbox
      checked={allSelected}
      onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
      aria-label="Select all"
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SelectionCell({ row }: { row: Row<any> }) {
  const rowSelection = useContext(RowSelectionContext);
  return (
    <Checkbox
      checked={!!rowSelection[row.id]}
      onCheckedChange={(v) => row.toggleSelected(!!v)}
      aria-label="Select row"
      onClick={(e) => e.stopPropagation()}
    />
  );
}
