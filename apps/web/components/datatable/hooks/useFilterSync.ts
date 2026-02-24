"use client";

import { useEffect } from "react";
import { ColumnFiltersState } from "@tanstack/react-table";
import type { FilterDef } from "../components/DataTableFilterControl";
import { filterUrlHandlers } from "../components/DataTableFilterControl";

/**
 * Sync column filters to URL params and sessionStorage.
 * Uses window.history.replaceState to update the URL without triggering
 * a Next.js navigation (which would fetch RSC payloads from the server
 * and can break behind reverse proxies).
 */
export function useFilterSync(
  columnFilters: ColumnFiltersState,
  filters: FilterDef[] | undefined,
  pathname: string,
) {
  useEffect(() => {
    if (!filters?.length) return;

    // Build new URL params from current filter state
    const currentQs = window.location.search.replace(/^\?/, "");
    const params = new URLSearchParams(currentQs);
    for (const f of filters) {
      const paramName = f.urlParamName ?? f.columnId;
      const value = columnFilters.find((cf) => cf.id === f.columnId)?.value;
      filterUrlHandlers[f.type].serialize(paramName, value, params);
    }
    const newQs = params.toString();

    // Only update URL if the query string actually changed
    if (newQs !== currentQs) {
      const newUrl = newQs
        ? `${window.location.pathname}?${newQs}`
        : window.location.pathname;
      window.history.replaceState(window.history.state, "", newUrl);
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
  }, [columnFilters, filters, pathname]);
}
