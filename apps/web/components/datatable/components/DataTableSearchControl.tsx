"use client";

import type { ColumnFiltersState, RowData } from "@tanstack/react-table";
import type { AppTable } from "../tableFeatures";
import { Input } from "@/components/ui/input";

type DataTableSearchControlProps<T extends RowData> = {
  table: AppTable<T>;
  filterColumnName?: string;
  columnFilters: ColumnFiltersState;
};

export function DataTableSearchControl<T extends RowData>({
  table,
  filterColumnName,
  columnFilters,
}: DataTableSearchControlProps<T>) {
  return (
    <>
      {filterColumnName != null && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            type="search"
            value={
              (columnFilters.find((f) => f.id === filterColumnName)
                ?.value as string) ?? ""
            }
            onChange={(event) =>
              table
                .getColumn(filterColumnName)
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-10"
          />
        </div>
      )}
    </>
  );
}
