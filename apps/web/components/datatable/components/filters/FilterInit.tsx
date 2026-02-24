"use client";

import { Suspense } from "react";
import type { FilterDef } from "../DataTableFilterControl";
import { useFilterInitialization } from "../../hooks/useFilterInitialization";
import { ColumnFiltersState } from "@tanstack/react-table";

function FilterInitContent({
  filters,
  setColumnFilters,
}: {
  filters?: FilterDef[];
  setColumnFilters: (filters: ColumnFiltersState) => void;
}) {
  useFilterInitialization(filters, setColumnFilters);
  return null;
}

/**
 * Reads initial filter state from URL params and sessionStorage.
 * Wrapped in Suspense due to useSearchParams.
 */
export function FilterInit({
  filters,
  setColumnFilters,
}: {
  filters?: FilterDef[];
  setColumnFilters: (filters: ColumnFiltersState) => void;
}) {
  return (
    <Suspense fallback={null}>
      <FilterInitContent
        filters={filters}
        setColumnFilters={setColumnFilters}
      />
    </Suspense>
  );
}
