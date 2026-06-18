"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// Note: list pages must include usePreferences() in their queryGate so the
// preferences are loaded before this hook runs — that lets the saved order
// apply synchronously on the first render. The effect below is only a fallback.
import type { ColumnDef } from "@tanstack/react-table";
import { usePreferences, useUpsertPreference } from "@/hooks/use-preferences";
import {
  columnOrderPreferenceKey,
  getOrderableColumnIds,
  mergeSavedOrder,
  parseSavedOrder,
  serializeColumnOrder,
} from "../utils/columnOrder";

type Params<T> = {
  tableId: string;
  columns: ColumnDef<T>[];
};

type ColumnOrderPreference = {
  /** Orderable content column ids in their effective (user-chosen) order. */
  order: string[];
  /** Reorder the content columns and persist the new order. */
  setOrder: (next: string[]) => void;
};

/**
 * Owns the DataTable content column order and keeps it in sync with per-user
 * preference storage. Mirrors {@link useColumnVisibilityPreference}:
 *
 * - Initial state merges any already-cached saved order into the default
 *   (definition) order, so a cached preference applies on the very first
 *   render. The page gate loads preferences first, so this is the normal path.
 * - The effect is a fallback for when preferences weren't cached yet.
 * - `setOrder` updates state and persists the new order.
 *
 * The returned `order` covers only the reorderable content columns; callers are
 * responsible for pinning fixed columns (e.g. the selection column) around it.
 */
export function useColumnOrderPreference<T>({
  tableId,
  columns,
}: Params<T>): ColumnOrderPreference {
  const { data: preferences, isPending } = usePreferences();
  const upsert = useUpsertPreference();

  const orderableIds = useMemo(() => getOrderableColumnIds(columns), [columns]);

  const readSaved = (): string[] | null =>
    preferences
      ? parseSavedOrder(preferences.get(columnOrderPreferenceKey(tableId)))
      : null;

  const [order, setOrderState] = useState<string[]>(() =>
    mergeSavedOrder(orderableIds, readSaved()),
  );

  // Saved prefs are applied at init when already cached; the ref guards against
  // re-applying over later edits.
  const appliedRef = useRef(preferences !== undefined);

  useEffect(() => {
    if (appliedRef.current || isPending) return;
    appliedRef.current = true;
    const saved = readSaved();
    if (saved) setOrderState(mergeSavedOrder(orderableIds, saved));
    // readSaved closes over the current preferences/tableId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, preferences, tableId, orderableIds]);

  const setOrder = useCallback(
    (next: string[]) => {
      // A deliberate change is also the latest source of truth, so stop any
      // pending preference load from overwriting it.
      appliedRef.current = true;
      const reconciled = mergeSavedOrder(orderableIds, next);
      setOrderState(reconciled);
      upsert.mutate({
        key: columnOrderPreferenceKey(tableId),
        value: serializeColumnOrder(reconciled),
      });
    },
    [orderableIds, tableId, upsert],
  );

  return { order, setOrder };
}
