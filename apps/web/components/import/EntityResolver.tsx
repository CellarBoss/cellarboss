"use client";

import type { GenericType } from "@cellarboss/types";
import type { ResolvedEntity } from "@/lib/import/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NEW = "__new__";
const NONE = "__none__";

type EntityResolverProps = {
  label: string;
  /** Value scraped from the page (shown as a hint), if any. */
  scrapedValue: string | null;
  /** Existing records to choose from. */
  entities: GenericType[];
  value: ResolvedEntity;
  onChange: (value: ResolvedEntity) => void;
  /** Allow a "None" choice (e.g. region is optional on a wine). */
  allowNone?: boolean;
};

function selectValue(value: ResolvedEntity): string {
  if (value.existingId != null) return `id:${value.existingId}`;
  if (value.newName != null) return NEW;
  return NONE;
}

export function EntityResolver({
  label,
  scrapedValue,
  entities,
  value,
  onChange,
  allowNone = false,
}: EntityResolverProps) {
  const isNew = value.existingId == null && value.newName != null;

  function handleSelect(next: string) {
    if (next === NONE) {
      onChange({ existingId: null, newName: null });
    } else if (next === NEW) {
      onChange({ existingId: null, newName: scrapedValue ?? "" });
    } else {
      onChange({ existingId: Number(next.slice(3)), newName: null });
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {scrapedValue ? (
          <Badge variant="secondary" title="Detected from the page">
            Found: {scrapedValue}
          </Badge>
        ) : (
          <Badge variant="outline">Not detected</Badge>
        )}
      </div>
      <Select value={selectValue(value)} onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Choose ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {allowNone && <SelectItem value={NONE}>None</SelectItem>}
          <SelectItem value={NEW}>
            ➕ Create new{scrapedValue ? `: ${scrapedValue}` : ""}
          </SelectItem>
          {entities.map((entity) => (
            <SelectItem key={entity.id} value={`id:${entity.id}`}>
              {entity.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isNew && (
        <Input
          aria-label={`New ${label} name`}
          value={value.newName ?? ""}
          placeholder={`New ${label.toLowerCase()} name`}
          onChange={(e) =>
            onChange({ existingId: null, newName: e.target.value })
          }
        />
      )}
    </div>
  );
}
