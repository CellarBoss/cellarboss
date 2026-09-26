import type { FilterFn, RowData } from "@tanstack/react-table";
import type { AppFeatures } from "../tableFeatures";

export type RangeFilterValue = { min?: number; max?: number };

export function rangeFilter<T extends RowData>(): FilterFn<AppFeatures, T> {
  const filter: FilterFn<AppFeatures, T> = (
    row,
    columnId,
    filterValue: RangeFilterValue,
  ) => {
    if (!filterValue) return true;
    const { min, max } = filterValue;
    if (min === undefined && max === undefined) return true;
    const val = row.getValue<number>(columnId);
    if (min !== undefined && val < min) return false;
    if (max !== undefined && val > max) return false;
    return true;
  };
  filter.autoRemove = (val: RangeFilterValue) =>
    !val || (val.min === undefined && val.max === undefined);
  return filter;
}
