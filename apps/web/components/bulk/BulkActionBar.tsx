"use client";

import { Trash, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type BulkActionBarProps = {
  selectedCount: number;
  onClear: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
};

export function BulkActionBar({ selectedCount, onClear, onDelete, onEdit }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-2 mt-2 mb-2 rounded-md border bg-muted/50">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <div className="ml-auto flex items-center gap-2">
        {onEdit && (
          <Button size="sm" variant="outline" onClick={onEdit} className="cursor-pointer">
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button size="sm" variant="destructive" onClick={onDelete} className="cursor-pointer">
            <Trash className="w-4 h-4 mr-1" />
            Delete
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onClear} className="cursor-pointer">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
