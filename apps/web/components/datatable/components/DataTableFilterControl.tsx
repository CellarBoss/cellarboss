"use client";

import type { ColumnFiltersState, RowData } from "@tanstack/react-table";
import type { AppTable } from "../tableFeatures";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ListFilter, X } from "lucide-react";
import type { RangeFilterValue } from "../filters/rangeFilter";
import { getActiveFilters, getFilterValue } from "./filters/activeFilters";
import { FlatMultiSelectFilter } from "./filters/FlatMultiSelectFilter";
import { GroupedMultiSelectFilter } from "./filters/GroupedMultiSelectFilter";
import {
  type FlatMultiSelectFilterDef,
  type GroupedMultiSelectFilterDef,
} from "./filters/multiSelectFilterUtils";
import { RangeFilter, type RangeFilterDef } from "./filters/RangeFilter";

export const FilterType = {
  MultiSelect: "multiselect",
  GroupedMultiSelect: "grouped-multiselect",
  Range: "range",
} as const;

export type {
  FlatMultiSelectFilterDef,
  GroupedMultiSelectFilterDef,
  RangeFilterDef,
};
export type FilterDef =
  FlatMultiSelectFilterDef | GroupedMultiSelectFilterDef | RangeFilterDef;

type DataTableFilterControlProps<T extends RowData> = {
  filters: FilterDef[];
  table: AppTable<T>;
  columnFilters: ColumnFiltersState;
};

function getFilterComponent<T extends RowData>(
  filter: FilterDef,
  table: AppTable<T>,
  columnFilters: ColumnFiltersState,
): React.ReactNode {
  switch (filter.type) {
    case FilterType.Range:
      return (
        <RangeFilter
          key={filter.columnId}
          filter={filter}
          table={table}
          activeValue={
            getFilterValue(columnFilters, filter.columnId) as
              RangeFilterValue | undefined
          }
        />
      );
    case FilterType.MultiSelect:
      return (
        <FlatMultiSelectFilter
          key={filter.columnId}
          filter={filter as FlatMultiSelectFilterDef}
          table={table}
          activeValues={
            getFilterValue(columnFilters, filter.columnId) as
              string[] | undefined
          }
        />
      );
    case FilterType.GroupedMultiSelect:
      return (
        <GroupedMultiSelectFilter
          key={filter.columnId}
          filter={filter as GroupedMultiSelectFilterDef}
          table={table}
          activeValues={
            getFilterValue(columnFilters, filter.columnId) as
              string[] | undefined
          }
        />
      );
    default:
      const _exhaustive: never = filter;
      return _exhaustive;
  }
}

/**
 * A single "Filters" button whose panel lists every filter on the left and
 * the chosen filter's options on the right, followed by a removable tag for
 * each active filter. Keeps the toolbar one row high however many filters a
 * table defines.
 */
export function DataTableFilterControl<T extends RowData>({
  filters,
  table,
  columnFilters,
}: DataTableFilterControlProps<T>) {
  const [selectedColumnId, setSelectedColumnId] = useState(
    filters[0]?.columnId,
  );
  const selectedFilter =
    filters.find((f) => f.columnId === selectedColumnId) ?? filters[0];

  const activeFilters = getActiveFilters(filters, columnFilters);
  const activeColumnIds = new Set(activeFilters.map((a) => a.filter.columnId));

  const clearFilter = (columnId: string) => {
    table.getColumn(columnId)?.setFilterValue(undefined);
  };

  const handleClearAll = () => {
    table.setColumnFilters([]);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-10">
            <ListFilter className="h-4 w-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge className="ml-1">{activeFilters.length}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex w-[min(30rem,calc(100vw-2rem))] max-h-[min(24rem,var(--radix-popover-content-available-height,24rem))] p-0"
        >
          <nav
            aria-label="Filters"
            className="w-40 shrink-0 overflow-y-auto border-r p-1"
          >
            {filters.map((filter) => (
              <button
                key={filter.columnId}
                type="button"
                aria-current={filter === selectedFilter ? "true" : undefined}
                onClick={() => setSelectedColumnId(filter.columnId)}
                className={cn(
                  "flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
                  filter === selectedFilter && "bg-accent font-medium",
                )}
              >
                {filter.label}
                {activeColumnIds.has(filter.columnId) && (
                  <>
                    <span
                      aria-hidden
                      className="size-1.5 rounded-full bg-primary"
                    />
                    <span className="sr-only">(active)</span>
                  </>
                )}
              </button>
            ))}
          </nav>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {selectedFilter &&
                getFilterComponent(selectedFilter, table, columnFilters)}
            </div>
            {activeFilters.length > 0 && (
              <div className="flex justify-end border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {activeFilters.map(({ filter, summary }) => (
        <Badge
          key={filter.columnId}
          variant="outline"
          className="h-8 gap-1 pr-1 text-sm font-normal"
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          <span className="max-w-48 truncate">{summary}</span>
          <button
            type="button"
            aria-label={`Remove ${filter.label} filter`}
            onClick={() => clearFilter(filter.columnId)}
            className="rounded-full p-0.5 hover:bg-accent"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}

      {activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-8 text-xs"
        >
          Clear all
        </Button>
      )}
    </>
  );
}
