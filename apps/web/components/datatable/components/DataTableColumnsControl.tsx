"use client";

import { Column, Table as TableInstance } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Columns3 } from "lucide-react";

/** Human-readable label for a column, or null if it shouldn't appear in the menu. */
function getColumnLabel<T>(column: Column<T, unknown>): string | null {
  const meta = column.columnDef.meta;
  if (meta?.isSuppressed) return null;
  if (meta?.label) return meta.label;
  const header = column.columnDef.header;
  if (typeof header === "string" && header.trim() !== "") return header;
  // Columns without a usable label (selection, action columns) are omitted.
  return null;
}

type Props<T> = {
  table: TableInstance<T>;
};

export function DataTableColumnsControl<T>({ table }: Props<T>) {
  "use no memo"; // reads live, mutable table state; must always re-render

  const items = table
    .getAllLeafColumns()
    .map((column) => ({ column, label: getColumnLabel(column) }))
    .filter(
      (item): item is { column: Column<T, unknown>; label: string } =>
        item.label !== null,
    );

  if (items.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <Columns3 className="mr-2 h-4 w-4" />
          Columns
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 max-h-[var(--radix-popover-content-available-height,auto)] overflow-y-auto p-4">
        <div className="space-y-3">
          <div className="text-sm font-medium">Columns</div>
          <div className="space-y-2">
            {items.map(({ column, label }) => {
              const canHide = column.getCanHide();
              return (
                <div key={column.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`column-toggle-${column.id}`}
                    checked={column.getIsVisible()}
                    disabled={!canHide}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`column-toggle-${column.id}`}
                    className={
                      "text-sm font-medium leading-none " +
                      (canHide
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-70")
                    }
                  >
                    {label}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
