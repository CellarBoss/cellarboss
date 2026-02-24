"use client";

import { RowSelectionState } from "@tanstack/react-table";

export interface BulkActionHandlers {
  handleBulkDeleteConfirm: () => Promise<void>;
  handleBulkEditSave: (partial: Record<string, any>) => Promise<void>;
}

export function useBulkActions<T>(
  selectedRows: T[],
  onBulkDelete: ((rows: T[]) => Promise<void>) | undefined,
  onBulkEdit:
    | ((rows: T[], partial: Record<string, string | number>) => Promise<void>)
    | undefined,
  setRowSelection: (selection: RowSelectionState) => void,
  setEditDialogOpen: (open: boolean) => void,
): BulkActionHandlers {
  async function handleBulkDeleteConfirm() {
    if (!onBulkDelete) return;
    await onBulkDelete(selectedRows);
    setRowSelection({});
  }

  async function handleBulkEditSave(partial: Record<string, any>) {
    if (!onBulkEdit) return;
    await onBulkEdit(selectedRows, partial);
    setRowSelection({});
    setEditDialogOpen(false);
  }

  return {
    handleBulkDeleteConfirm,
    handleBulkEditSave,
  };
}
