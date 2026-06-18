"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { usePreferencesContext } from "@/contexts/preferences-context";
import { useUpsertPreference } from "@/hooks/use-preferences";
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
 * - Preferences are guaranteed loaded by {@link PreferencesProvider}, so the
 *   saved order is read synchronously from context at init and applies on the
 *   very first render.
 * - `setOrder` updates state and persists the new order.
 *
 * The returned `order` covers only the reorderable content columns; callers are
 * responsible for pinning fixed columns (e.g. the selection column) around it.
 */
export function useColumnOrderPreference<T>({
  tableId,
  columns,
}: Params<T>): ColumnOrderPreference {
  const preferences = usePreferencesContext();
  const upsert = useUpsertPreference();

  const orderableIds = useMemo(() => getOrderableColumnIds(columns), [columns]);

  const [order, setOrderState] = useState<string[]>(() =>
    mergeSavedOrder(
      orderableIds,
      parseSavedOrder(preferences.get(columnOrderPreferenceKey(tableId))),
    ),
  );

  const setOrder = useCallback(
    (next: string[]) => {
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
