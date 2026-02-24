"use client";

import {
  ColumnFiltersState,
  Table as TableInstance,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { RangeFilterValue } from "../filters/rangeFilter";
import { FlatMultiSelectFilter } from "./filters/FlatMultiSelectFilter";
import { GroupedMultiSelectFilter } from "./filters/GroupedMultiSelectFilter";
import {
  type FlatMultiSelectFilterDef,
  type GroupedMultiSelectFilterDef,
  multiSelectUrlHandler,
} from "./filters/multiSelectFilterUtils";
import {
  RangeFilter,
  type RangeFilterDef,
  rangeUrlHandler,
} from "./filters/RangeFilter";

export const FilterType = {
  MultiSelect: "multiselect",
  GroupedMultiSelect: "grouped-multiselect",
  Range: "range",
} as const;

export type FilterUrlHandler = {
  serialize(paramName: string, value: unknown, params: URLSearchParams): void;
  deserialize(paramName: string, searchParams: URLSearchParams): unknown | null;
};

export const filterUrlHandlers: Record<
  (typeof FilterType)[keyof typeof FilterType],
  FilterUrlHandler
> = {
  [FilterType.Range]: rangeUrlHandler,
  [FilterType.MultiSelect]: multiSelectUrlHandler,
  [FilterType.GroupedMultiSelect]: multiSelectUrlHandler,
};

export type {
  FlatMultiSelectFilterDef,
  GroupedMultiSelectFilterDef,
  RangeFilterDef,
};
export type FilterDef =
  | FlatMultiSelectFilterDef
  | GroupedMultiSelectFilterDef
  | RangeFilterDef;

type DataTableFilterControlProps<T> = {
  filters: FilterDef[];
  table: TableInstance<T>;
  columnFilters: ColumnFiltersState;
};

function isRangeActive(val: unknown): boolean {
  const r = val as RangeFilterValue | undefined;
  return r?.min !== undefined || r?.max !== undefined;
}

function getFilterValue(
  columnFilters: ColumnFiltersState,
  columnId: string,
): unknown {
  return columnFilters.find((cf) => cf.id === columnId)?.value;
}

function getFilterComponent<T>(
  filter: FilterDef,
  table: TableInstance<T>,
  columnFilters: ColumnFiltersState,
): React.ReactNode {
  switch (filter.type) {
    case FilterType.Range:
      return (
        <RangeFilter
          key={filter.columnId}
          filter={filter}
          table={table}
          activeValue={getFilterValue(columnFilters, filter.columnId) as RangeFilterValue | undefined}
        />
      );
    case FilterType.MultiSelect:
      return (
        <FlatMultiSelectFilter
          key={filter.columnId}
          filter={filter as FlatMultiSelectFilterDef}
          table={table}
          activeValues={getFilterValue(columnFilters, filter.columnId) as string[] | undefined}
        />
      );
    case FilterType.GroupedMultiSelect:
      return (
        <GroupedMultiSelectFilter
          key={filter.columnId}
          filter={filter as GroupedMultiSelectFilterDef}
          table={table}
          activeValues={getFilterValue(columnFilters, filter.columnId) as string[] | undefined}
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
      {filters.map((filter) => getFilterComponent(filter, table, columnFilters))}

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
