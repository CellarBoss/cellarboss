import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GenericType } from "@cellarboss/types";

type GenericSelectorProps<T extends GenericType> = {
  options: T[],
  allowMultiple?: boolean,
  editable?: boolean,
  isInvalid: boolean,
  field: any,
}

export function GenericSelector<T extends GenericType>({
  options,
  isInvalid,
  allowMultiple = false,
  editable = true,
  field,
}: GenericSelectorProps<T>) {
  if (allowMultiple) {
    return (
      <MultiSelect<T>
        options={options}
        isInvalid={isInvalid}
        editable={editable}
        field={field}
      />
    );
  }

  return (
    <Select
      name={field.name}
      onValueChange={(e) => field.handleChange(e)}
      aria-invalid={isInvalid}
      disabled={!editable}
      value={field.state.value ?? ""}
    >
      <SelectTrigger>
        <SelectValue placeholder="Choose an option..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.id}
            value={option.id.toString()}
          >
            {option.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MultiSelect<T extends GenericType>({
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
      <PopoverContent className="w-full p-2" align="start">
        <div className="max-h-60 overflow-y-auto flex flex-col gap-1">
          {options.map((option) => {
            const id = option.id.toString();
            const checked = selectedIds.includes(id);
            return (
              <label
                key={option.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => handleToggle(id)}
                />
                {option.name}
              </label>
            );
          })}
          {options.length === 0 && (
            <span className="text-muted-foreground text-sm px-2 py-1">No options available</span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
