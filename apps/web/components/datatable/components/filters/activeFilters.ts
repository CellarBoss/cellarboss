import type { ColumnFiltersState } from "@tanstack/react-table";
import type { RangeFilterValue } from "../../filters/rangeFilter";
import type { RangeFilterDef } from "./RangeFilter";
import type {
  FlatMultiSelectFilterDef,
  GroupedMultiSelectFilterDef,
  MultiSelectOption,
} from "./multiSelectFilterUtils";

type AnyFilterDef =
  FlatMultiSelectFilterDef | GroupedMultiSelectFilterDef | RangeFilterDef;

// Beyond this many selected values, a summary shows a count instead of labels
const MAX_LISTED_VALUES = 2;

export type ActiveFilter<D extends AnyFilterDef = AnyFilterDef> = {
  filter: D;
  summary: string;
};

export function getFilterValue(
  columnFilters: ColumnFiltersState,
  columnId: string,
): unknown {
  return columnFilters.find((cf) => cf.id === columnId)?.value;
}

export function isFilterValueActive(
  filter: AnyFilterDef,
  value: unknown,
): boolean {
  if (filter.type === "range") {
    const range = value as RangeFilterValue | undefined;
    return range?.min !== undefined || range?.max !== undefined;
  }
  return ((value as string[] | undefined)?.length ?? 0) > 0;
}

function optionsOf(filter: AnyFilterDef): MultiSelectOption[] {
  if (filter.type === "multiselect") return filter.options;
  if (filter.type === "grouped-multiselect") {
    return filter.options.flatMap((group) => group.options);
  }
  return [];
}

export function summarizeFilterValue(
  filter: AnyFilterDef,
  value: unknown,
): string {
  if (filter.type === "range") {
    const { min, max } = (value as RangeFilterValue | undefined) ?? {};
    if (min !== undefined && max !== undefined) return `${min} – ${max}`;
    if (min !== undefined) return `≥ ${min}`;
    return `≤ ${max}`;
  }

  const selected = (value as string[] | undefined) ?? [];
  if (selected.length > MAX_LISTED_VALUES) {
    return `${selected.length} selected`;
  }
  const labels = new Map(optionsOf(filter).map((o) => [o.value, o.label]));
  return selected.map((v) => labels.get(v) ?? v).join(", ");
}

/** The filters with a value set, in the order they were defined. */
export function getActiveFilters<D extends AnyFilterDef>(
  filters: D[],
  columnFilters: ColumnFiltersState,
): ActiveFilter<D>[] {
  return filters.flatMap((filter) => {
    const value = getFilterValue(columnFilters, filter.columnId);
    if (!isFilterValueActive(filter, value)) return [];
    return [{ filter, summary: summarizeFilterValue(filter, value) }];
  });
}
