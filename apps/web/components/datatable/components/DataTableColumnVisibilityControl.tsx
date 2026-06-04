"use client";

import type { Table } from "@tanstack/react-table";
import { Columns3, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getColumnLabel, isColumnHideable } from "../utils/columnVisibility";

type DataTableColumnVisibilityControlProps<T> = {
  table: Table<T>;
  onReset: () => void;
};

export function DataTableColumnVisibilityControl<T>({
  table,
  onReset,
}: DataTableColumnVisibilityControlProps<T>) {
  const columns = table.getAllLeafColumns().filter(isColumnHideable);

  if (columns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Columns"
          title="Columns"
        >
          <Columns3 className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(checked) =>
              column.toggleVisibility(checked === true)
            }
            onSelect={(event) => event.preventDefault()}
          >
            {getColumnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onReset}>
          <RotateCcw className="size-4" />
          Reset
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
