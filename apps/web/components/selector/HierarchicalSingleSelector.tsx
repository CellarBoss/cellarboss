"use client";

import { useState, useMemo } from "react";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GenericType } from "@cellarboss/types";

type TreeNode = {
  item: GenericType;
  depth: number;
};

function getParent(item: GenericType): number | null {
  return (item as unknown as Record<string, unknown>)["parent"] as number | null;
}

function buildFlatTree(
  options: GenericType[],
  parentId: number | null = null,
  depth = 0
): TreeNode[] {
  const result: TreeNode[] = [];
  for (const option of options) {
    if (getParent(option) === parentId) {
      result.push({ item: option, depth });
      result.push(...buildFlatTree(options, option.id, depth + 1));
    }
  }
  return result;
}

export default function HierarchicalSingleSelector({
  options,
  isInvalid,
  editable,
  field,
}: {
  options: GenericType[];
  isInvalid: boolean;
  editable: boolean;
  field: any;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentValue = field.state.value ?? "";
  const selectedOption = options.find((o) => o.id.toString() === currentValue);

  const flatTree = useMemo(() => buildFlatTree(options), [options]);

  // Map each item id to its parent id for efficient ancestor traversal
  const parentMap = useMemo(() => {
    const map = new Map<number, number | null>();
    for (const option of options) {
      map.set(option.id, getParent(option));
    }
    return map;
  }, [options]);

  // When a search is active, show matching items plus all their ancestors
  const visibleTree = useMemo(() => {
    const trimmed = search.trim().toLowerCase();
    if (!trimmed) return flatTree;

    const matchingIds = new Set<number>();
    for (const { item } of flatTree) {
      if (item.name.toLowerCase().includes(trimmed)) {
        matchingIds.add(item.id);
      }
    }

    const visibleIds = new Set<number>();
    for (const id of matchingIds) {
      visibleIds.add(id);
      let parentId = parentMap.get(id) ?? null;
      while (parentId !== null) {
        visibleIds.add(parentId);
        parentId = parentMap.get(parentId) ?? null;
      }
    }

    return flatTree.filter(({ item }) => visibleIds.has(item.id));
  }, [search, flatTree, parentMap]);

  if (!editable) {
    return (
      <div className="flex min-h-9 items-center px-3 py-2 border rounded-md bg-muted text-sm">
        {selectedOption?.name ?? (
          <span className="text-muted-foreground">None</span>
        )}
      </div>
    );
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={open}
          aria-invalid={isInvalid}
          className="w-full justify-between font-normal"
        >
          {selectedOption ? selectedOption.name : "Choose an option..."}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {visibleTree.map(({ item, depth }) => {
              const id = item.id.toString();
              const isMatch =
                !search.trim() ||
                item.name.toLowerCase().includes(search.trim().toLowerCase());
              return (
                <CommandItem
                  key={item.id}
                  value={id}
                  style={{ paddingLeft: `${depth * 16 + 8}px` }}
                  className={cn(!isMatch && "text-muted-foreground")}
                  onSelect={() => {
                    field.handleChange(id === currentValue ? "" : id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {depth > 0 && (
                    <span className="text-muted-foreground mr-1">└</span>
                  )}
                  {item.name}
                  <CheckIcon
                    className={cn(
                      "ml-auto size-4",
                      currentValue === id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
