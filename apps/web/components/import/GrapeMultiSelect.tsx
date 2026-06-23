"use client";

import { useState } from "react";
import type { GenericType } from "@cellarboss/types";
import type { ResolvedEntity } from "@/lib/import/types";
import MultiSelector from "@/components/selector/MultipleSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GrapeMultiSelectProps = {
  /** Existing grape records to choose from. */
  entities: GenericType[];
  value: ResolvedEntity[];
  onChange: (value: ResolvedEntity[]) => void;
};

/**
 * Grape picker for the import form. Reuses the same multi-select as the wine
 * form for choosing existing grapes, and keeps any scraped-but-unmatched grapes
 * (plus free-text additions) as "to be created" badges, since those aren't yet
 * in the options list.
 */
export function GrapeMultiSelect({
  entities,
  value,
  onChange,
}: GrapeMultiSelectProps) {
  const [newGrape, setNewGrape] = useState("");

  const created = value.filter((g) => g.existingId == null && g.newName);

  // MultiSelector expects a TanStack-form `field`; shim the bits it reads.
  const field = {
    state: {
      value: value
        .filter((g) => g.existingId != null)
        .map((g) => String(g.existingId)),
    },
    handleChange: (ids: string[]) => {
      const selected: ResolvedEntity[] = ids.map((id) => ({
        existingId: Number(id),
        newName: null,
      }));
      onChange([...selected, ...created]);
    },
  };

  function addNew() {
    const name = newGrape.trim();
    setNewGrape("");
    if (!name) return;
    const exists =
      created.some((g) => g.newName?.toLowerCase() === name.toLowerCase()) ||
      entities.some((e) => e.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    onChange([...value, { existingId: null, newName: name }]);
  }

  function removeCreated(name: string) {
    onChange(value.filter((g) => g.newName !== name));
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Grapes</Label>
      <MultiSelector
        options={entities}
        isInvalid={false}
        editable
        field={field}
      />
      {created.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {created.map((g) => (
            <Badge key={g.newName} variant="outline" className="gap-1">
              ➕ {g.newName}
              <button
                type="button"
                aria-label={`Remove ${g.newName}`}
                className="text-muted-foreground hover:text-foreground"
                onClick={() => removeCreated(g.newName as string)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <Input
          value={newGrape}
          placeholder="Add a new grape…"
          onChange={(e) => setNewGrape(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addNew();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addNew}
          disabled={!newGrape.trim()}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
