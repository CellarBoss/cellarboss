"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Note: list pages must include usePreferences() in their queryGate so the
// preferences are loaded before this hook runs — that lets the saved visibility
// apply synchronously on the first render. The effect below is only a fallback.
import type {
  ColumnDef,
  OnChangeFn,
  VisibilityState,
} from "@tanstack/react-table";
import { usePreferences, useUpsertPreference } from "@/hooks/use-preferences";
import {
  columnPreferenceKey,
  computeDefaultColumnVisibility,
  getHideableColumnIds,
  mergeSavedVisibility,
  parseSavedVisibility,
  serializeColumnVisibility,
} from "../utils/columnVisibility";

type Params<T> = {
  tableId: string;
  columns: ColumnDef<T>[];
};

type ColumnVisibilityPreference = {
  columnVisibility: VisibilityState;
  onColumnVisibilityChange: OnChangeFn<VisibilityState>;
};

/**
 * Owns DataTable column visibility and keeps it in sync with per-user
 * preference storage.
 *
 * - Initial state merges any already-cached saved preference into the computed
 *   defaults, so a cached preference applies on the very first render. The page
 *   gate loads preferences first, so this is the normal path.
 * - The effect is a fallback: if preferences weren't cached yet, it applies
 *   them once the query settles.
 * - `onColumnVisibilityChange` updates state and persists the new visibility.
 */
export function useColumnVisibilityPreference<T>({
  tableId,
  columns,
}: Params<T>): ColumnVisibilityPreference {
  const { data: preferences, isPending } = usePreferences();
  const upsert = useUpsertPreference();

  const hideableIds = useMemo(() => getHideableColumnIds(columns), [columns]);

  const readSaved = (): VisibilityState | null =>
    preferences
      ? parseSavedVisibility(preferences.get(columnPreferenceKey(tableId)))
      : null;

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () =>
      mergeSavedVisibility(
        computeDefaultColumnVisibility(columns),
        readSaved(),
        hideableIds,
      ),
  );

  // Saved prefs are applied at init when already cached; the ref guards against
  // re-applying over later edits.
  const appliedRef = useRef(preferences !== undefined);

  useEffect(() => {
    if (appliedRef.current || isPending) return;
    appliedRef.current = true;
    const saved = readSaved();
    if (saved) {
      setColumnVisibility((prev) =>
        mergeSavedVisibility(prev, saved, hideableIds),
      );
    }
    // readSaved closes over the current preferences/tableId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, preferences, tableId, hideableIds]);

  const onColumnVisibilityChange = useCallback<OnChangeFn<VisibilityState>>(
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
    [columnVisibility, hideableIds, tableId, upsert],
  );

  return { columnVisibility, onColumnVisibilityChange };
}
