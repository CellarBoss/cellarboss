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
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { columnMenuLabel } from "../utils/columnOrder";

/** Human-readable label for a column, or null if it shouldn't appear in the menu. */
function getColumnLabel<T>(column: Column<T, unknown>): string | null {
  return columnMenuLabel(column.columnDef);
}

/** A single draggable column row: drag handle + visibility checkbox. */
function SortableColumnItem<T>({
  column,
  label,
}: {
  column: Column<T, unknown>;
  label: string;
}) {
  "use no memo"; // reads live, mutable column visibility state

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const canHide = column.getCanHide();
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        "flex items-center gap-2 " +
        (isDragging ? "relative z-10 opacity-80" : "")
      }
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${label}`}
        {...attributes}
        {...listeners}
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  if (items.length === 0) return null;

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = columnOrder.indexOf(String(active.id));
    const to = columnOrder.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    onColumnOrderChange(arrayMove(columnOrder, from, to));
  };

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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((column) => column.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((column) => (
                  <SortableColumnItem
                    key={column.id}
                    column={column}
                    label={getColumnLabel(column) as string}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </PopoverContent>
    </Popover>
  );
}
