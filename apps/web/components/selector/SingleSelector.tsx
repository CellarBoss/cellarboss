import type { FieldBinding } from "@/lib/types/field";
import { useState } from "react";
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
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GenericType } from "@cellarboss/types";
import type { OptionGroup } from "./DataSelector";
import { pendingName, pendingValue } from "@/lib/functions/import";
import { CreateOption } from "./CreateOption";

export default function SingleSelector<T extends GenericType>({
  options,
  isInvalid,
  editable,
  field,
  groups,
  allowCreate = false,
}: {
  options: T[];
  isInvalid: boolean;
  editable: boolean;
  field: FieldBinding;
  groups?: OptionGroup[];
  allowCreate?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const currentValue = field.state.value ?? "";
  const pending = pendingName(currentValue);
  const selectedOption = options.find((o) => o.id.toString() === currentValue);
  const selectedLabel = pending ? `${pending} (new)` : selectedOption?.name;

  if (!editable) {
    return (
      <div className="flex min-h-9 items-center px-3 py-2 border rounded-md bg-muted text-sm">
        {selectedLabel ?? <span className="text-muted-foreground">None</span>}
      </div>
    );
  }

  function renderItem(option: GenericType) {
    const id = option.id.toString();
    return (
      <CommandItem
        key={option.id}
        value={option.name}
        onSelect={() => {
          field.handleChange(id === currentValue ? "" : id);
          setOpen(false);
        }}
      >
        {option.name}
        <CheckIcon
          className={cn(
            "ml-auto size-4",
            currentValue === id ? "opacity-100" : "opacity-0",
          )}
        />
      </CommandItem>
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
          {selectedLabel ?? "Choose an option..."}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="min-w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {allowCreate && (
              <CreateOption
                search={search}
                options={options}
                onCreate={(name) => {
                  field.handleChange(pendingValue(name));
                  setOpen(false);
                  setSearch("");
                }}
              />
            )}
            {groups ? (
              groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.options.map(renderItem)}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>{options.map(renderItem)}</CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
