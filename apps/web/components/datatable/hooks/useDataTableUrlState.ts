"use client";

import { useMemo, useRef, useCallback } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import type {
  ColumnFiltersState,
  ExpandedState,
  PaginationState,
} from "@tanstack/react-table";
import {
  FilterType,
  type FilterDef,
} from "../components/DataTableFilterControl";
import type { RangeFilterValue } from "../filters/rangeFilter";

const NUQS_OPTIONS = {
  history: "replace",
  scroll: false,
  shallow: true,
} as const;

// --- Parser builders ---

function buildStringParsers(
  filters: FilterDef[] | undefined,
  filterColumnName: string | undefined,
  hasExpansion?: boolean,
): Record<string, typeof parseAsString> {
  const p: Record<string, typeof parseAsString> = {};
  if (filterColumnName) p.search = parseAsString;
  if (hasExpansion) p.expanded = parseAsString;
  for (const f of filters ?? []) {
    if (f.type !== FilterType.Range) {
      p[f.urlParamName ?? f.columnId] = parseAsString;
    }
  }
  return p;
}

function buildIntParsers(
  filters: FilterDef[] | undefined,
): Record<string, typeof parseAsInteger> {
  const p: Record<string, typeof parseAsInteger> = {
    page: parseAsInteger,
    pageSize: parseAsInteger,
  };
  for (const f of filters ?? []) {
    if (f.type === FilterType.Range) {
      const name = f.urlParamName ?? f.columnId;
      p[`${name}Min`] = parseAsInteger;
      p[`${name}Max`] = parseAsInteger;
    }
  }
  return p;
}

// --- Converters ---

type StrState = Record<string, string | null>;
type IntState = Record<string, number | null>;

function toColumnFilters(
  str: StrState,
  int: IntState,
  filters: FilterDef[] | undefined,
  filterColumnName: string | undefined,
): ColumnFiltersState {
  const result: ColumnFiltersState = [];

  if (filterColumnName && str.search) {
    result.push({ id: filterColumnName, value: str.search });
  }

  for (const f of filters ?? []) {
    const name = f.urlParamName ?? f.columnId;
    if (f.type === FilterType.Range) {
      const min = int[`${name}Min`] ?? null;
      const max = int[`${name}Max`] ?? null;
      if (min !== null || max !== null) {
        const val: RangeFilterValue = {};
        if (min !== null) val.min = min;
        if (max !== null) val.max = max;
        result.push({ id: f.columnId, value: val });
      }
    } else {
      const val = str[name];
      if (val) result.push({ id: f.columnId, value: val.split(",") });
    }
  }

  return result;
}

function fromColumnFilters(
  columnFilters: ColumnFiltersState,
  filters: FilterDef[] | undefined,
  filterColumnName: string | undefined,
): { str: StrState; int: IntState } {
  const str: StrState = {};
  const int: IntState = {};

  if (filterColumnName) {
    const cf = columnFilters.find((cf) => cf.id === filterColumnName);
    str.search = (cf?.value as string) || null;
  }

  for (const f of filters ?? []) {
    const name = f.urlParamName ?? f.columnId;
    if (f.type === FilterType.Range) {
      const cf = columnFilters.find((cf) => cf.id === f.columnId);
      const val = cf?.value as RangeFilterValue | undefined;
      int[`${name}Min`] = val?.min ?? null;
      int[`${name}Max`] = val?.max ?? null;
    } else {
      const cf = columnFilters.find((cf) => cf.id === f.columnId);
      const val = cf?.value as string[] | undefined;
      str[name] = val?.length ? val.join(",") : null;
    }
  }

  return { str, int };
}

// --- Expanded state converters ---

function toExpandedState(
  urlValue: string | null,
  defaultExpanded: ExpandedState,
): ExpandedState {
  if (urlValue === null) return defaultExpanded;
  if (urlValue === "") return {};
  if (urlValue === "all") return true;
  const record: Record<string, boolean> = {};
  for (const id of urlValue.split(",")) {
    record[id] = true;
  }
  return record;
}

function fromExpandedState(
  expanded: ExpandedState,
  defaultExpanded: ExpandedState,
): string | null {
  // If it matches the default, clear the URL param
  if (expanded === defaultExpanded) return null;
  if (expanded === true) return "all";
  if (typeof expanded === "object") {
    const ids = Object.keys(expanded).filter((k) => expanded[k]);
    return ids.length > 0 ? ids.join(",") : "";
  }
  return null;
}

// --- Hook ---

export function useDataTableUrlState({
  filters,
  filterColumnName,
  defaultPageSize = 20,
  hasExpansion = false,
  defaultExpanded,
}: {
  filters?: FilterDef[];
  filterColumnName?: string;
  defaultPageSize?: number;
  hasExpansion?: boolean;
  defaultExpanded?: ExpandedState;
}) {
  const resolvedDefaultExpanded = defaultExpanded ?? {};

  // Parsers are computed once — filters and filterColumnName are always stable
  // (defined at module level in pages, never change at runtime)
  const strParsers = useRef(
    buildStringParsers(filters, filterColumnName, hasExpansion),
  ).current;
  const intParsers = useRef(buildIntParsers(filters)).current;

  const [strState, setStrState] = useQueryStates(strParsers, NUQS_OPTIONS);
  const [intState, setIntState] = useQueryStates(intParsers, NUQS_OPTIONS);

  const columnFilters = useMemo(
    () =>
      toColumnFilters(
        strState as StrState,
        intState as IntState,
        filters,
        filterColumnName,
      ),
    [strState, intState], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const pagination = useMemo(
    (): PaginationState => ({
      pageIndex: intState.page != null ? (intState.page as number) - 1 : 0,
      pageSize:
        intState.pageSize != null
          ? (intState.pageSize as number)
          : defaultPageSize,
    }),
    [intState.page, intState.pageSize, defaultPageSize], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const expanded = useMemo(
    () =>
      toExpandedState(
        (strState as StrState).expanded ?? null,
        resolvedDefaultExpanded,
      ),
    [(strState as StrState).expanded], // eslint-disable-line react-hooks/exhaustive-deps
  );

  function setColumnFilters(
    newFilters:
      | ColumnFiltersState
      | ((prev: ColumnFiltersState) => ColumnFiltersState),
  ) {
    const resolved =
      typeof newFilters === "function" ? newFilters(columnFilters) : newFilters;
    const { str, int } = fromColumnFilters(resolved, filters, filterColumnName);
    // Reset to page 1 whenever filters change
    void setStrState(str);
    void setIntState({ ...int, page: null });
  }

  function setPagination(
    newPag: PaginationState | ((prev: PaginationState) => PaginationState),
  ) {
    const resolved = typeof newPag === "function" ? newPag(pagination) : newPag;
    void setIntState({
      page: resolved.pageIndex === 0 ? null : resolved.pageIndex + 1,
      pageSize:
        resolved.pageSize !== defaultPageSize ? resolved.pageSize : null,
    });
  }

  const setExpanded = useCallback(
    (
      newExpanded: ExpandedState | ((prev: ExpandedState) => ExpandedState),
    ) => {
      const resolved =
        typeof newExpanded === "function" ? newExpanded(expanded) : newExpanded;
      void setStrState((prev) => ({
        ...prev,
        expanded: fromExpandedState(resolved, resolvedDefaultExpanded),
      }));
    },
    [expanded, resolvedDefaultExpanded, setStrState],
  );

  return {
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    expanded,
    setExpanded,
  };
}
