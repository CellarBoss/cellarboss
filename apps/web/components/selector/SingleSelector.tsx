import { useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { GenericType } from "@cellarboss/types";
import type { OptionGroup } from "./DataSelector";

export default function SingleSelector<T extends GenericType>({
  options,
  isInvalid,
  editable,
  field,
  groups,
}: {
  options: T[];
  isInvalid: boolean;
  editable: boolean;
  field: any;
  groups?: OptionGroup[];
}) {
  const [open, setOpen] = useState(false);

  const currentValue = field.state.value ?? "";
  const selectedOption = options.find(
    (o) => o.id.toString() === currentValue
  );

  if (!editable) {
    return (
      <div className="flex min-h-9 items-center px-3 py-2 border rounded-md bg-muted text-sm">
        {selectedOption?.name ?? (
          <span className="text-muted-foreground">None</span>
        )}
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
            currentValue === id ? "opacity-100" : "opacity-0"
          )}
        />
      </CommandItem>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          type="button"
          aria-expanded={open}
          aria-invalid={isInvalid}
          className="w-full justify-between font-normal"
        >
          {selectedOption
            ? selectedOption.name
            : "Choose an option..."}
          <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {groups ? (
              groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {group.options.map(renderItem)}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>
                {options.map(renderItem)}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}