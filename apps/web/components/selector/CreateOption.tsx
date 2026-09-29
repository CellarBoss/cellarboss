import { PlusIcon } from "lucide-react";
import { CommandGroup, CommandItem } from "@/components/ui/command";
import type { GenericType } from "@cellarboss/types";

/** A Create "…" item, shown while the search doesn't exactly name an option. */
export function CreateOption({
  search,
  options,
  onCreate,
}: {
  search: string;
  options: GenericType[];
  onCreate: (name: string) => void;
}) {
  const name = search.trim();
  const key = name.toLocaleLowerCase();
  if (!name || options.some((o) => o.name.toLocaleLowerCase() === key)) {
    return null;
  }
  return (
    <CommandGroup forceMount>
      <CommandItem
        forceMount
        value={`create:${name}`}
        onSelect={() => onCreate(name)}
      >
        <PlusIcon className="size-4" />
        Create &ldquo;{name}&rdquo;
      </CommandItem>
    </CommandGroup>
  );
}
