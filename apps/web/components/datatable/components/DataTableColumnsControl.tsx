"use client";

import { Column, Table as TableInstance } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical, Settings2 } from "lucide-react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  KeyboardSensor,
  PointerSensor,
  PointerActivationConstraints,
} from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { columnMenuLabel } from "../utils/columnOrder";

// Activate dragging after a small pointer movement rather than the library's
// default press-and-hold delay, so a column can be grabbed and reordered in one
// motion. KeyboardSensor keeps the list reorderable via the keyboard.
const sensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 4 }),
    ],
  }),
  KeyboardSensor,
];

/** Human-readable label for a column, or null if it shouldn't appear in the menu. */
function getColumnLabel<T>(column: Column<T, unknown>): string | null {
  return columnMenuLabel(column.columnDef);
}

/** A single draggable column row: drag handle + visibility checkbox. */
function SortableColumnItem<T>({
  column,
  label,
  index,
}: {
  column: Column<T, unknown>;
  label: string;
  index: number;
}) {
  "use no memo"; // reads live, mutable column visibility state

  const { ref, handleRef, isDragging } = useSortable({ id: column.id, index });

  const canHide = column.getCanHide();

  return (
    <div
      ref={ref}
      className={
        "flex items-center gap-2 " +
        (isDragging ? "relative z-10 opacity-80" : "")
      }
    >
      <button
        type="button"
        ref={handleRef}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
      >
        <GripVertical className="h-4 w-4" />
      </button>
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
          (canHide ? "cursor-pointer" : "cursor-not-allowed opacity-70")
        }
      >
        {label}
      </label>
    </div>
  );
}

type Props<T> = {
  table: TableInstance<T>;
  /** Reorderable content column ids in their current effective order. */
  columnOrder: string[];
  /** Persist a new content column order. */
  onColumnOrderChange: (next: string[]) => void;
};

export function DataTableColumnsControl<T>({
  table,
  columnOrder,
  onColumnOrderChange,
}: Props<T>) {
  "use no memo"; // reads live, mutable table state; must always re-render

  const columnsById = new Map(
    table.getAllLeafColumns().map((column) => [column.id, column]),
  );
  // Render in the current (user-chosen) order. The orderable set matches the
  // menu set, so columnOrder lists exactly the rows shown here.
  const items = columnOrder
    .map((id) => columnsById.get(id))
    .filter(
      (column): column is Column<T, unknown> =>
        !!column && getColumnLabel(column) !== null,
    );

  if (items.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-10">
          <Settings2 className="mr-2 h-4 w-4" />
          Configure Table
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 max-h-[var(--radix-popover-content-available-height,auto)] overflow-y-auto p-4">
        <div className="space-y-3">
          <div className="text-sm font-medium">Columns</div>
          <p className="text-xs text-muted-foreground">
            Drag to reorder. Toggle to show or hide.
          </p>
          <DragDropProvider
            sensors={sensors}
            modifiers={[RestrictToVerticalAxis]}
            onDragEnd={(event) => {
              if (event.operation.canceled) return;
              // With optimistic sorting the dragged item ends up over itself in
              // its new slot, so source/target ids can match even on a real move.
              // Let `move` compute the order from the projected index and only
              // persist when it actually changed.
              const next = move(columnOrder, event);
              if (next.join() !== columnOrder.join()) {
                onColumnOrderChange(next);
              }
            }}
          >
            <div className="space-y-2">
              {items.map((column, index) => (
                <SortableColumnItem
                  key={column.id}
                  column={column}
                  label={getColumnLabel(column) as string}
                  index={index}
                />
              ))}
            </div>
          </DragDropProvider>
        </div>
      </PopoverContent>
    </Popover>
  );
}
