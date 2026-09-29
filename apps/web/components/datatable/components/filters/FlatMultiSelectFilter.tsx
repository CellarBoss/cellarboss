"use client";

import type { RowData } from "@tanstack/react-table";
import type { AppTable } from "../../tableFeatures";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type FlatMultiSelectFilterDef,
  toggleFilterValue,
} from "./multiSelectFilterUtils";

type Props<T extends RowData> = {
  filter: FlatMultiSelectFilterDef;
  table: AppTable<T>;
  activeValues: string[] | undefined;
};

export function FlatMultiSelectFilter<T extends RowData>({
  filter,
  table,
  activeValues,
}: Props<T>) {
  const handleOptionChange = (value: string, checked: boolean) => {
    table
      .getColumn(filter.columnId)
      ?.setFilterValue(toggleFilterValue(activeValues, value, checked));
  };

  const sortedOptions = filter.sort
    ? filter.sort(filter.options)
    : filter.options.sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-2">
      {sortedOptions.map((option) => (
        <div key={option.value} className="flex items-center space-x-2">
          <Checkbox
            id={`${filter.columnId}-${option.value}`}
            checked={activeValues?.includes(option.value) ?? false}
            onCheckedChange={(checked) =>
              handleOptionChange(option.value, checked as boolean)
            }
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
  );
}
