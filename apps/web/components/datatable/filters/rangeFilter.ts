import { FilterFn } from "@tanstack/react-table";

export type RangeFilterValue = { min?: number; max?: number };

export const rangeFilter: FilterFn<any> = (
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

rangeFilter.autoRemove = (val: RangeFilterValue) =>
  !val || (val.min === undefined && val.max === undefined);
