"use client";

import { Table as TableInstance } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { type GroupedMultiSelectFilterDef } from "./multiSelectFilterUtils";

type Props<T> = {
  filter: GroupedMultiSelectFilterDef;
  table: TableInstance<T>;
  activeValues: string[] | undefined;
};

export function GroupedMultiSelectFilter<T>({
  filter,
  table,
  activeValues,
}: Props<T>) {
  const activeCount = activeValues?.length || 0;

  const handleOptionChange = (value: string, checked: boolean) => {
    const newValues = activeValues ? [...activeValues] : [];
    if (checked) {
      if (!newValues.includes(value)) {
        newValues.push(value);
      }
    } else {
      const index = newValues.indexOf(value);
      if (index > -1) {
        newValues.splice(index, 1);
      }
    }
    table
      .getColumn(filter.columnId)
      ?.setFilterValue(newValues.length > 0 ? newValues : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          {filter.label}
          <ChevronDown className="ml-2 h-4 w-4" />
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 max-h-[var(--radix-popover-content-available-height,auto)] overflow-y-auto p-4">
        <div className="space-y-3">
          <div className="text-sm font-medium">{filter.label}</div>
          <div className="space-y-2">
            {filter.options.map((group) => (
              <div key={group.group}>
                <div className="text-xs font-semibold text-muted-foreground py-1.5 px-1">
                  {group.group}
                </div>
                <div className="pl-3 space-y-2">
                  {group.options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2"
                    >
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
        </div>
      </PopoverContent>
    </Popover>
  );
}
