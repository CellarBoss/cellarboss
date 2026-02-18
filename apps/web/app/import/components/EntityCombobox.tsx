"use client";

import { useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon } from "lucide-react";
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
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GenericType } from "@cellarboss/types";
import type { EntityValue } from "@/lib/api/import";

type EntityComboboxProps = {
  label: string;
  value: EntityValue | null;
  onChange: (value: EntityValue | null) => void;
  entities: GenericType[];
  placeholder?: string;
  nullable?: boolean;
};

export function EntityCombobox({
  label,
  value,
  onChange,
  entities,
  placeholder = "Search or create...",
  nullable = true,
}: EntityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = entities.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = entities.find(
    (e) => e.name.toLowerCase() === search.toLowerCase()
  );

  const showCreateOption = search.trim().length > 0 && !exactMatch;

  function handleSelect(entity: GenericType) {
    onChange({ type: "existing", id: entity.id, name: entity.name });
    setOpen(false);
    setSearch("");
  }

  function handleCreate(name: string) {
    onChange({ type: "new", name: name.trim() });
    setOpen(false);
    setSearch("");
  }

  function handleClear() {
    onChange(null);
    setOpen(false);
    setSearch("");
  }

  const displayName = value?.name ?? null;
  const isNew = value?.type === "new";
  const isExisting = value?.type === "existing";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch(""); }}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              type="button"
              aria-expanded={open}
              className="flex-1 justify-between font-normal"
            >
              <span className={cn("truncate", !displayName && "text-muted-foreground")}>
                {displayName ?? placeholder}
              </span>
              <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="min-w-[--radix-popover-trigger-width] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={`Search ${label.toLowerCase()}...`}
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {nullable && value && (
                  <>
                    <CommandItem onSelect={handleClear} className="text-muted-foreground">
                      Clear selection
                    </CommandItem>
                    <CommandSeparator />
                  </>
                )}
                {showCreateOption && (
                  <CommandItem
                    onSelect={() => handleCreate(search)}
                    className="text-emerald-700 font-medium"
                  >
                    <PlusIcon className="mr-2 size-4" />
                    Create &quot;{search.trim()}&quot;
                  </CommandItem>
                )}
                {showCreateOption && filtered.length > 0 && <CommandSeparator />}
                <CommandGroup>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {filtered.map((entity) => (
                    <CommandItem
                      key={entity.id}
                      value={entity.name}
                      onSelect={() => handleSelect(entity)}
                    >
                      {entity.name}
                      <CheckIcon
                        className={cn(
                          "ml-auto size-4",
                          isExisting && value?.id === entity.id
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {isNew && (
          <Badge variant="outline" className="shrink-0 border-orange-400 text-orange-600 bg-orange-50">
            New
          </Badge>
        )}
        {isExisting && (
          <Badge variant="outline" className="shrink-0 border-emerald-400 text-emerald-600 bg-emerald-50">
            Existing
          </Badge>
        )}
      </div>
    </div>
  );
}

// ── Multi-entity variant (for grapes) ─────────────────────────────────────────

type MultiEntityComboboxProps = {
  label: string;
  values: EntityValue[];
  onChange: (values: EntityValue[]) => void;
  entities: GenericType[];
};

export function MultiEntityCombobox({
  label,
  values,
  onChange,
  entities,
}: MultiEntityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedNames = new Set(values.map((v) => v.name.toLowerCase()));

  const filtered = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = entities.find(
    (e) => e.name.toLowerCase() === search.toLowerCase()
  );
  const showCreateOption = search.trim().length > 0 && !exactMatch && !selectedNames.has(search.toLowerCase().trim());

  function isSelected(entity: GenericType) {
    return values.some(
      (v) => v.type === "existing" && v.id === entity.id
    );
  }

  function handleToggle(entity: GenericType) {
    if (isSelected(entity)) {
      onChange(values.filter((v) => !(v.type === "existing" && v.id === entity.id)));
    } else {
      onChange([...values, { type: "existing", id: entity.id, name: entity.name }]);
    }
  }

  function handleCreate(name: string) {
    const trimmed = name.trim();
    if (!selectedNames.has(trimmed.toLowerCase())) {
      onChange([...values, { type: "new", name: trimmed }]);
    }
    setSearch("");
  }

  function handleRemove(value: EntityValue) {
    onChange(values.filter((v) => v.name !== value.name || v.type !== value.type));
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch(""); }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            type="button"
            aria-expanded={open}
            className="w-full justify-start font-normal min-h-9 h-auto"
          >
            {values.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {values.map((v) => (
                  <Badge
                    key={v.name}
                    variant="secondary"
                    className={cn(
                      v.type === "new" && "border-orange-400 text-orange-600 bg-orange-50"
                    )}
                  >
                    {v.name}
                    {v.type === "new" && <span className="ml-1 text-[10px] opacity-70">new</span>}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground">Add {label.toLowerCase()}...</span>
            )}
            <ChevronsUpDownIcon className="ml-auto size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="min-w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {showCreateOption && (
                <CommandItem
                  onSelect={() => handleCreate(search)}
                  className="text-emerald-700 font-medium"
                >
                  <PlusIcon className="mr-2 size-4" />
                  Add &quot;{search.trim()}&quot;
                </CommandItem>
              )}
              {showCreateOption && filtered.length > 0 && <CommandSeparator />}
              <CommandGroup>
                <CommandEmpty>No results found.</CommandEmpty>
                {filtered.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={entity.name}
                    onSelect={() => handleToggle(entity)}
                  >
                    <CheckIcon
                      className={cn(
                        "mr-2 size-4",
                        isSelected(entity) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {entity.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((v) => (
            <span
              key={v.name}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border",
                v.type === "new"
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700"
              )}
            >
              {v.name}
              <span className="opacity-60">{v.type === "new" ? "new" : "existing"}</span>
              <button
                type="button"
                onClick={() => handleRemove(v)}
                className="ml-0.5 hover:opacity-70"
                aria-label={`Remove ${v.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
