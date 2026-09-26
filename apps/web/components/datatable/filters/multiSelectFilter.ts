import type { FilterFn, RowData } from "@tanstack/react-table";
import type { AppFeatures } from "../tableFeatures";

// Custom filter function for multi-select filters
export function multiSelectFilter<T extends RowData>(): FilterFn<
  AppFeatures,
  T
> {
  const filter: FilterFn<AppFeatures, T> = (
    row,
    columnId,
    filterValue: string[],
  ) => {
    if (!filterValue || filterValue.length === 0) return true;
    const rawValue = row.getValue(columnId);
    return filterValue.includes(String(rawValue));
  };
  filter.autoRemove = (val: string[]) => !val || val.length === 0;
  return filter;
}
