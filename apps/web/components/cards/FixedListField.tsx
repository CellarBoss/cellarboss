"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { SelectOption } from "@/lib/types/field";

type FixedListFieldProps = {
  field: any;
  editable: boolean;
  options: SelectOption[];
};

export function FixedListField({ field, editable, options }: FixedListFieldProps) {
  const currentValue: string = field.state.value ?? "";
  const selectedOption = options.find((o) => o.value === currentValue);

  if (!editable) {
    return (
      <div className="flex min-h-9 items-center px-3 py-2 border rounded-md bg-muted text-sm">
        {selectedOption?.label ?? <span className="text-muted-foreground">None</span>}
      </div>
    );
  }

  return (
    <Select value={currentValue} onValueChange={(val) => field.handleChange(val)}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
