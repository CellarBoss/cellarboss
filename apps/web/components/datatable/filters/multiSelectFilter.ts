import { FilterFn } from "@tanstack/react-table";

// Custom filter function for multi-select filters
export const multiSelectFilter: FilterFn<any> = (
  row,
  columnId,
  filterValue: string[],
) => {
  if (!filterValue || filterValue.length === 0) return true;
  const rawValue = row.getValue(columnId);
  return filterValue.includes(String(rawValue));
};

multiSelectFilter.autoRemove = (val: string[]) => !val || val.length === 0;
