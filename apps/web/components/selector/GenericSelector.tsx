import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  allowMultiple = false, // TODO: Allow multiple selection
  editable = true,
  field,
}: GenericSelectorProps<T>) {
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