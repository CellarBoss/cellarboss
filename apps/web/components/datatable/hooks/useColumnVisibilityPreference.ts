"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type {
  ColumnDef,
  OnChangeFn,
  VisibilityState,
} from "@tanstack/react-table";
import { usePreferences, useUpsertPreference } from "@/hooks/use-preferences";
import {
  columnPreferenceKey,
  getHideableColumnIds,
  mergeSavedVisibility,
  parseSavedVisibility,
  serializeColumnVisibility,
} from "../utils/columnVisibility";

type Params<T> = {
  tableId: string;
  columns: ColumnDef<T>[];
  columnVisibility: VisibilityState;
  setColumnVisibility: (
    value: VisibilityState | ((prev: VisibilityState) => VisibilityState),
  ) => void;
};

/**
 * Bridges DataTable column visibility with per-user preference storage.
 *
 * - Once preferences load, overlays the saved visibility for hideable columns
 *   onto the computed defaults (applied once, so it never clobbers later edits).
 * - Returns an `onColumnVisibilityChange` handler that updates local state and
 *   persists the new visibility for the table's hideable columns.
 */
export function useColumnVisibilityPreference<T>({
  tableId,
  columns,
  columnVisibility,
  setColumnVisibility,
}: Params<T>): OnChangeFn<VisibilityState> {
  const { data: preferences } = usePreferences();
  const upsert = useUpsertPreference();

  const hideableIds = useMemo(() => getHideableColumnIds(columns), [columns]);

  // Apply the saved preference exactly once, after preferences resolve.
  const appliedRef = useRef(false);
  useEffect(() => {
    if (appliedRef.current || !preferences) return;
    appliedRef.current = true;
    const saved = parseSavedVisibility(
      preferences.get(columnPreferenceKey(tableId)),
    );
    if (!saved) return;
    setColumnVisibility((prev) =>
      mergeSavedVisibility(prev, saved, hideableIds),
    );
  }, [preferences, tableId, hideableIds, setColumnVisibility]);

  return useCallback<OnChangeFn<VisibilityState>>(
    (updater) => {
      const next =
        typeof updater === "function" ? updater(columnVisibility) : updater;
      // A deliberate change is also the latest source of truth, so stop any
      // pending preference load from overwriting it.
      appliedRef.current = true;
      setColumnVisibility(next);
      upsert.mutate({
        key: columnPreferenceKey(tableId),
        value: serializeColumnVisibility(next, hideableIds),
      });
    },
    [columnVisibility, setColumnVisibility, hideableIds, tableId, upsert],
  );
}
