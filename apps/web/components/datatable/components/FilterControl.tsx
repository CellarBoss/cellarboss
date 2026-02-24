"use client";

import { Table } from "@tanstack/react-table";
import { Input } from "@/components/ui/input"
import { ColumnFiltersState } from "@tanstack/react-table";

type FilterControlProps = {
  table: Table<any>;
  filterColumnName?: string;
  columnFilters: ColumnFiltersState;
};

export function FilterControl({ table, filterColumnName, columnFilters }: FilterControlProps) {
  return (
    <>
      {filterColumnName != null && (
        <div className="flex items-center py-4">
          <Input
            placeholder="Search..."
            type="search"
            value={
              (columnFilters.find(f => f.id === filterColumnName)?.value as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn(filterColumnName)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
    </>
  );
}