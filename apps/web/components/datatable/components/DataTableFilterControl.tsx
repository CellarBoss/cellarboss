"use client";

import { ColumnFiltersState, Table as TableInstance } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { RangeFilterValue } from "../filters/rangeFilter";
import { DataTableMultiSelectFilter, type MultiSelectFilterDef, multiSelectUrlHandler } from "./filters/DataTableMultiSelectFilter";
import { DataTableRangeFilter, type RangeFilterDef, rangeUrlHandler } from "./filters/DataTableRangeFilter";

export enum FilterType {
  MultiSelect = "multiselect",
  Range = "range",
}

export type FilterUrlHandler = {
  serialize(paramName: string, value: unknown, params: URLSearchParams): void;
  deserialize(paramName: string, searchParams: URLSearchParams): unknown | null;
};

export const filterUrlHandlers: Record<FilterType, FilterUrlHandler> = {
  [FilterType.Range]: rangeUrlHandler,
  [FilterType.MultiSelect]: multiSelectUrlHandler,
};

export type { MultiSelectFilterDef, RangeFilterDef };
export type FilterDef = MultiSelectFilterDef | RangeFilterDef;

type DataTableFilterControlProps<T> = {
  filters: FilterDef[];
  table: TableInstance<T>;
  columnFilters: ColumnFiltersState;
};

function isRangeActive(val: unknown): boolean {
  const r = val as RangeFilterValue | undefined;
  return r?.min !== undefined || r?.max !== undefined;
}

function getFilterComponent<T>(
  filter: FilterDef,
  table: TableInstance<T>
): React.ReactNode {
  switch (filter.type) {
    case FilterType.Range:
      return <DataTableRangeFilter key={filter.columnId} filter={filter} table={table} />;
    case FilterType.MultiSelect:
      return (
        <DataTableMultiSelectFilter
          key={filter.columnId}
          filter={filter as MultiSelectFilterDef}
          table={table}
        />
      );
    default:
      const _exhaustive: never = filter;
      return _exhaustive;
  }
}

export function DataTableFilterControl<T>({
  filters,
  table,
  columnFilters,
}: DataTableFilterControlProps<T>) {
  const hasActiveFilters = columnFilters.some((f) => {
    const def = filters.find((d) => d.columnId === f.id);
    if (!def) return false;
    if (def.type === FilterType.Range) {
      return isRangeActive(f.value);
    }
    return (f.value as string[])?.length > 0;
  });

  const handleClearAll = () => {
    for (const filter of filters) {
      table.getColumn(filter.columnId)?.setFilterValue(undefined);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => getFilterComponent(filter, table))}

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-10 text-xs"
        >
          ✕ Clear
        </Button>
      )}
    </div>
  );
}
