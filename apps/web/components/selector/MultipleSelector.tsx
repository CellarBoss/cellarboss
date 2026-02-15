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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GenericType } from "@cellarboss/types";

export default function MultiSelector<T extends GenericType>({
  options,
  isInvalid,
  editable,
  field,
}: {
  options: T[];
  isInvalid: boolean;
  editable: boolean;
  field: any;
}) {
  const selectedIds: string[] = Array.isArray(field.state.value) ? field.state.value : [];

  const selectedNames = options
    .filter((o) => selectedIds.includes(o.id.toString()))
    .map((o) => o.name);

  function handleToggle(id: string) {
    const current: string[] = Array.isArray(field.state.value) ? [...field.state.value] : [];
    const index = current.indexOf(id);
    if (index >= 0) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    field.handleChange(current);
  }

  if (!editable) {
    return (
      <div className="flex flex-wrap gap-1 min-h-9 items-center px-3 py-2 border rounded-md bg-muted">
        {selectedNames.length > 0 ? (
          selectedNames.map((name) => (
            <Badge key={name} variant="secondary">{name}</Badge>
          ))
        ) : (
          <span className="text-muted-foreground text-sm">None</span>
        )}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          type="button"
          aria-invalid={isInvalid}
          className="w-full justify-start font-normal min-h-9 h-auto"
        >
          {selectedNames.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedNames.map((name) => (
                <Badge key={name} variant="secondary">{name}</Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">Choose options...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No options found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const id = option.id.toString();
                const checked = selectedIds.includes(id);
                return (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => handleToggle(id)}
                  >
                    <Checkbox
                      checked={checked}
                      className="pointer-events-none"
                    />
                    {option.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}