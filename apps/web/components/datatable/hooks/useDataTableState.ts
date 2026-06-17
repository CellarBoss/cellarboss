"use client";

import { useState } from "react";
import {
  SortingState,
  RowSelectionState,
  Updater,
} from "@tanstack/react-table";

/**
 * Adapter function to convert React's setState to TanStack Table's OnChangeFn
 * Both have compatible signatures: (value | (prev) => value) => void
 */
export function createTableStateUpdater<T>(
  setState: (value: T | ((prev: T) => T)) => void,
) {
  return (updater: Updater<T>) => setState(updater);
}

export interface DataTableState {
  sorting: SortingState;
  rowSelection: RowSelectionState;
  deleteDialogOpen: boolean;
  editDialogOpen: boolean;
}

export interface DataTableStateSetters {
  setSorting: (
    sorting: SortingState | ((prev: SortingState) => SortingState),
  ) => void;
  setRowSelection: (
    selection:
      | RowSelectionState
      | ((prev: RowSelectionState) => RowSelectionState),
  ) => void;
  setDeleteDialogOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setEditDialogOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export function useDataTableState(
  defaultSortColumn?: string,
): DataTableState & DataTableStateSetters {
  const [sorting, setSorting] = useState<SortingState>(
    defaultSortColumn ? [{ id: defaultSortColumn, desc: false }] : [],
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return {
    sorting,
    rowSelection,
    deleteDialogOpen,
    editDialogOpen,
    setSorting,
    setRowSelection,
    setDeleteDialogOpen,
    setEditDialogOpen,
  };
}
