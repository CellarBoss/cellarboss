"use client";

import { useState, useEffect } from "react";
import { Table as TableInstance } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { type FilterUrlHandler } from "../DataTableFilterControl";
import type { RangeFilterValue } from "../../filters/rangeFilter";

export const rangeUrlHandler: FilterUrlHandler = {
  serialize(paramName, value, params) {
    const val = value as RangeFilterValue | undefined;
    if (val?.min !== undefined) {
      params.set(`${paramName}Min`, String(val.min));
    } else {
      params.delete(`${paramName}Min`);
    }
    if (val?.max !== undefined) {
      params.set(`${paramName}Max`, String(val.max));
    } else {
      params.delete(`${paramName}Max`);
    }
  },
  deserialize(paramName, searchParams) {
    const minVal = searchParams.get(`${paramName}Min`);
    const maxVal = searchParams.get(`${paramName}Max`);
    if (!minVal && !maxVal) return null;
    const rv: RangeFilterValue = {};
    if (minVal) rv.min = Number(minVal);
    if (maxVal) rv.max = Number(maxVal);
    return rv;
  },
};

export type RangeFilterDef = {
  type: "range";
  columnId: string;
  label: string;
  urlParamName?: string;
};

type Props<T> = {
  filter: RangeFilterDef;
  table: TableInstance<T>;
};

export function RangeFilter<T>({ filter, table }: Props<T>) {
  const rangeVal = table.getColumn(filter.columnId)?.getFilterValue() as
    | RangeFilterValue
    | undefined;
  const activeCount =
    (rangeVal?.min !== undefined ? 1 : 0) +
    (rangeVal?.max !== undefined ? 1 : 0);

  const [minInput, setMinInput] = useState<string>(
    rangeVal?.min?.toString() ?? "",
  );
  const [maxInput, setMaxInput] = useState<string>(
    rangeVal?.max?.toString() ?? "",
  );

  // Sync local input state with table filter value
  useEffect(() => {
    setMinInput(rangeVal?.min?.toString() ?? "");
    setMaxInput(rangeVal?.max?.toString() ?? "");
  }, [rangeVal]);

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
      <PopoverContent className="w-56 p-4">
        <div className="space-y-3">
          <div className="text-sm font-medium">{filter.label}</div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              min="0"
              value={minInput}
              onChange={(e) => {
                setMinInput(e.target.value);
                const min = e.target.value ? Number(e.target.value) : undefined;
                const newVal = { ...(rangeVal ?? {}), min };
                table
                  .getColumn(filter.columnId)
                  ?.setFilterValue(
                    newVal.min === undefined && newVal.max === undefined
                      ? undefined
                      : newVal,
                  );
              }}
              className="w-24"
            />
            <Input
              type="number"
              placeholder="Max"
              min="0"
              value={maxInput}
              onChange={(e) => {
                setMaxInput(e.target.value);
                const max = e.target.value ? Number(e.target.value) : undefined;
                const newVal = { ...(rangeVal ?? {}), max };
                table
                  .getColumn(filter.columnId)
                  ?.setFilterValue(
                    newVal.min === undefined && newVal.max === undefined
                      ? undefined
                      : newVal,
                  );
              }}
              className="w-24"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
