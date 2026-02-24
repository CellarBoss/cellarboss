"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  ExpandedState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
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
  pagination: PaginationState;
  columnFilters: ColumnFiltersState;
  sorting: SortingState;
  expanded: ExpandedState;
  rowSelection: RowSelectionState;
  columnVisibility: VisibilityState;
  deleteDialogOpen: boolean;
  editDialogOpen: boolean;
}

export interface DataTableStateSetters {
  setPagination: (
    pagination: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  setColumnFilters: (
    filters:
      | ColumnFiltersState
      | ((prev: ColumnFiltersState) => ColumnFiltersState),
  ) => void;
  setSorting: (
    sorting: SortingState | ((prev: SortingState) => SortingState),
  ) => void;
  setExpanded: (
    expanded: ExpandedState | ((prev: ExpandedState) => ExpandedState),
  ) => void;
  setRowSelection: (
    selection:
      | RowSelectionState
      | ((prev: RowSelectionState) => RowSelectionState),
  ) => void;
  setColumnVisibility: (
    visibility: VisibilityState | ((prev: VisibilityState) => VisibilityState),
  ) => void;
  setDeleteDialogOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setEditDialogOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export function useDataTableState<T>(
  columns: ColumnDef<T>[],
  defaultPageSize?: number,
  defaultSortColumn?: string,
  defaultExpanded?: true | Record<string, boolean>,
  getSubRows?: (row: T) => T[] | undefined,
): DataTableState & DataTableStateSetters {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize ?? 20,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [sorting, setSorting] = useState<SortingState>(
    defaultSortColumn ? [{ id: defaultSortColumn, desc: false }] : [],
  );

  const [expanded, setExpanded] = useState<ExpandedState>(
    defaultExpanded ?? (getSubRows ? true : {}),
  );

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      const visibility: VisibilityState = {};
      columns.forEach((col) => {
        const colId = (col as any).id ?? (col as any).accessorKey;
        const meta = (col as any).meta;
        if (meta?.hidden) {
          visibility[colId] = false;
        }
      });
      return visibility;
    },
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  return {
    pagination,
    columnFilters,
    sorting,
    expanded,
    rowSelection,
    columnVisibility,
    deleteDialogOpen,
    editDialogOpen,
    setPagination,
    setColumnFilters,
    setSorting,
    setExpanded,
    setRowSelection,
    setColumnVisibility,
    setDeleteDialogOpen,
    setEditDialogOpen,
  };
}
