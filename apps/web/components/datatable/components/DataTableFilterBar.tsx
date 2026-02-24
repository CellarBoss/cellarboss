"use client";

import { ColumnFiltersState, Table as TableInstance } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

export type FilterDef = {
  columnId: string;
  label: string;
  urlParamName?: string;
  options: Array<{ value: string; label: string }>;
};

type DataTableFilterBarProps<T> = {
  filters: FilterDef[];
  table: TableInstance<T>;
  columnFilters: ColumnFiltersState;
};

export function DataTableFilterBar<T>({
  filters,
  table,
  columnFilters,
}: DataTableFilterBarProps<T>) {
  const hasActiveFilters = columnFilters.some(
    (f) => filters.some((d) => d.columnId === f.id) && (f.value as string[])?.length > 0
  );

  const handleClearAll = () => {
    for (const filter of filters) {
      table.getColumn(filter.columnId)?.setFilterValue(undefined);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => {
        const activeValues = table
          .getColumn(filter.columnId)
          ?.getFilterValue() as string[] | undefined;
        const activeCount = activeValues?.length || 0;

        return (
          <Popover key={filter.columnId}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-10"
              >
                {filter.label}
                <ChevronDown className="ml-2 h-4 w-4" />
                {activeCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4">
              <div className="space-y-3">
                <div className="text-sm font-medium">{filter.label}</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filter.options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${filter.columnId}-${option.value}`}
                        checked={activeValues?.includes(option.value) ?? false}
                        onCheckedChange={(checked) => {
                          const newValues = activeValues ? [...activeValues] : [];
                          if (checked) {
                            if (!newValues.includes(option.value)) {
                              newValues.push(option.value);
                            }
                          } else {
                            const index = newValues.indexOf(option.value);
                            if (index > -1) {
                              newValues.splice(index, 1);
                            }
                          }
                          table
                            .getColumn(filter.columnId)
                            ?.setFilterValue(newValues.length > 0 ? newValues : undefined);
                        }}
                      />
                      <label
                        htmlFor={`${filter.columnId}-${option.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

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
