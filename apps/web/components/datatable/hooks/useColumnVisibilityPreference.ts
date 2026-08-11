"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  ColumnVisibilityState,
  OnChangeFn,
  RowData,
} from "@tanstack/react-table";
import type { AppColumnDef } from "../tableFeatures";
import { usePreferencesContext } from "@/contexts/preferences-context";
import { useUpsertPreference } from "@/hooks/use-preferences";
import {
  columnPreferenceKey,
  computeDefaultColumnVisibility,
  getHideableColumnIds,
  mergeSavedVisibility,
  parseSavedVisibility,
  serializeColumnVisibility,
} from "../utils/columnVisibility";

type Params<T extends RowData> = {
  tableId: string;
  columns: AppColumnDef<T>[];
};

type ColumnVisibilityPreference = {
  columnVisibility: ColumnVisibilityState;
  onColumnVisibilityChange: OnChangeFn<ColumnVisibilityState>;
};

/**
 * Owns DataTable column visibility and keeps it in sync with per-user
 * preference storage.
 *
 * Preferences are guaranteed loaded by {@link PreferencesProvider}, which gates
 * the authenticated subtree, so the saved visibility is read synchronously from
 * context at init and applies on the very first render — no two-stage load.
 *
 * `onColumnVisibilityChange` updates state and persists the new visibility.
 */
export function useColumnVisibilityPreference<T extends RowData>({
  tableId,
  columns,
}: Params<T>): ColumnVisibilityPreference {
  const preferences = usePreferencesContext();
  const upsert = useUpsertPreference();

  const hideableIds = useMemo(() => getHideableColumnIds(columns), [columns]);

  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>(() =>
      mergeSavedVisibility(
        computeDefaultColumnVisibility(columns),
        parseSavedVisibility(preferences.get(columnPreferenceKey(tableId))),
        hideableIds,
      ),
    );

  const onColumnVisibilityChange = useCallback<
    OnChangeFn<ColumnVisibilityState>
  >(
    (updater) => {
      const next =
        typeof updater === "function" ? updater(columnVisibility) : updater;
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
