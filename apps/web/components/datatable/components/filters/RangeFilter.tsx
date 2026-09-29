"use client";

import { useState } from "react";
import type { RowData } from "@tanstack/react-table";
import type { AppTable } from "../../tableFeatures";
import { Input } from "@/components/ui/input";
import type { RangeFilterValue } from "../../filters/rangeFilter";

export type RangeFilterDef = {
  type: "range";
  columnId: string;
  label: string;
  urlParamName?: string;
};

type Props<T extends RowData> = {
  filter: RangeFilterDef;
  table: AppTable<T>;
  activeValue: RangeFilterValue | undefined;
};

/** Minimum and maximum inputs for a numeric range filter. */
export function RangeFilter<T extends RowData>({
  filter,
  table,
  activeValue: rangeVal,
}: Props<T>) {
  const minFromProp = rangeVal?.min?.toString() ?? "";
  const maxFromProp = rangeVal?.max?.toString() ?? "";

  const [minInput, setMinInput] = useState(minFromProp);
  const [maxInput, setMaxInput] = useState(maxFromProp);

  // Sync local input state when prop changes (e.g. clear all, URL restore)
  if (minInput !== minFromProp) setMinInput(minFromProp);
  if (maxInput !== maxFromProp) setMaxInput(maxFromProp);

  return (
    <div className="flex gap-2">
      <Input
        type="number"
        placeholder="Min"
        aria-label={`${filter.label} minimum`}
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
        aria-label={`${filter.label} maximum`}
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
  );
}
