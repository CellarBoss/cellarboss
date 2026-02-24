"use client";

import { useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { ColumnFiltersState } from "@tanstack/react-table";
import type { FilterDef } from "../components/DataTableFilterBar";

/**
 * Initialize column filters from URL params (priority) or sessionStorage (fallback)
 */
export function useFilterInitialization(
  filters: FilterDef[] | undefined,
  setColumnFilters: (filters: ColumnFiltersState) => void
) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!filters?.length) return;

    const initial: ColumnFiltersState = [];

    // 1. Check URL params first
    for (const f of filters) {
      const paramName = f.urlParamName ?? f.columnId;
      const param = searchParams.get(paramName);
      if (param) {
        initial.push({ id: f.columnId, value: param.split(',') });
      }
    }

    // 2. Fall back to sessionStorage if no URL params
    if (initial.length === 0) {
      try {
        const saved = sessionStorage.getItem(`dtf-${pathname}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          initial.push(...parsed);
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (initial.length > 0) {
      setColumnFilters(initial);
    }
  }, []); // Mount only
}
