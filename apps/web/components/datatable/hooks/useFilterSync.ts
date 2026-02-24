"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnFiltersState } from "@tanstack/react-table";
import type { FilterDef } from "../components/DataTableFilterControl";
import { filterUrlHandlers } from "../components/DataTableFilterControl";

/**
 * Sync column filters to URL params and sessionStorage
 */
export function useFilterSync(
  columnFilters: ColumnFiltersState,
  filters: FilterDef[] | undefined,
  pathname: string,
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!filters?.length) return;

    // Update URL params
    const params = new URLSearchParams(searchParams.toString());
    for (const f of filters) {
      const paramName = f.urlParamName ?? f.columnId;
      const value = columnFilters.find((cf) => cf.id === f.columnId)?.value;
      filterUrlHandlers[f.type].serialize(paramName, value, params);
    }
    const newQs = params.toString();
    const currentQs = searchParams.toString();

    // Only update URL if the query string actually changed
    if (newQs !== currentQs) {
      router.replace(newQs ? `${pathname}?${newQs}` : pathname, {
        scroll: false,
      });
    }

    // Update sessionStorage
    try {
      const managedFilters = columnFilters.filter((cf) =>
        filters.some((f) => f.columnId === cf.id),
      );
      sessionStorage.setItem(`dtf-${pathname}`, JSON.stringify(managedFilters));
    } catch {
      // Ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnFilters, filters, pathname]);
}
