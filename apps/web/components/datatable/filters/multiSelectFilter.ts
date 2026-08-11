import type { FilterFn } from "@tanstack/react-table";
import type { AppFeatures } from "../tableFeatures";

// Custom filter function for multi-select filters
export const multiSelectFilter: FilterFn<AppFeatures, any> = (
  row,
  columnId,
  filterValue: string[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  const rawValue = row.getValue(columnId);
  return filterValue.includes(String(rawValue));
};

multiSelectFilter.autoRemove = (val: string[]) => !val || val.length === 0;
