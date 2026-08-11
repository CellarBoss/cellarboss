"use client";

import { useContext } from "react";
import type { RowData } from "@tanstack/react-table";
import type { AppCoreTable, AppRow } from "../../tableFeatures";
import { Checkbox } from "@/components/ui/checkbox";
import { RowSelectionContext } from "../../selection/RowSelectionContext";

export function SelectAllCheckbox<T extends RowData>({
  table,
}: {
  table: AppCoreTable<T>;
}) {
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

export function SelectionCell<T extends RowData>({ row }: { row: AppRow<T> }) {
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
