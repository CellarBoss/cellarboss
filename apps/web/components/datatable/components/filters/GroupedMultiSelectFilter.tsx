"use client";

import type { RowData } from "@tanstack/react-table";
import type { AppTable } from "../../tableFeatures";
import { Checkbox } from "@/components/ui/checkbox";
import {
  type GroupedMultiSelectFilterDef,
  toggleFilterValue,
} from "./multiSelectFilterUtils";

type Props<T extends RowData> = {
  filter: GroupedMultiSelectFilterDef;
  table: AppTable<T>;
  activeValues: string[] | undefined;
};

/** Checkbox list of a multi-select filter's options, under group headings. */
export function GroupedMultiSelectFilter<T extends RowData>({
  filter,
  table,
  activeValues,
}: Props<T>) {
  const handleOptionChange = (value: string, checked: boolean) => {
    table
      .getColumn(filter.columnId)
      ?.setFilterValue(toggleFilterValue(activeValues, value, checked));
  };

  const sortedGroups = filter.sort
    ? filter.sort(filter.options)
    : filter.options.sort((a, b) => a.group.localeCompare(b.group));

  return (
    <div className="space-y-2">
      {sortedGroups.map((group) => (
        <div key={group.group}>
          <div className="text-xs font-semibold text-muted-foreground py-1.5 px-1">
            {group.group}
          </div>
          <div className="pl-3 space-y-2">
            {group.options
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((option) => (
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
        </div>
      ))}
    </div>
  );
}
