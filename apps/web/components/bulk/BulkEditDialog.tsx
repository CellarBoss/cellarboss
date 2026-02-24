"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BulkEditSelectOption = { value: string; label: string };

export type BulkEditField<T> = {
  key: keyof T & string;
  label: string;
} & (
  | { type: "select"; options: BulkEditSelectOption[] }
  | { type: "text" }
  | { type: "date" }
  | { type: "number"; min?: number; step?: number }
);

type BulkEditDialogProps<T> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  fields: BulkEditField<T>[];
  onSave: (partial: Record<string, string | number>) => Promise<void>;
};

export function BulkEditDialog<T>({
  open,
  onOpenChange,
  selectedCount,
  fields,
  onSave,
}: BulkEditDialogProps<T>) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setValue(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const partial: Record<string, string | number> = {};
      for (const field of fields) {
        const raw = values[field.key];
        if (raw === undefined || raw === "") continue;
        if (field.type === "number") {
          partial[field.key] = Number(raw);
        } else {
          partial[field.key] = raw;
        }
      }
      await onSave(partial);
      setValues({});
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      setValues({});
      setError(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {selectedCount} {selectedCount === 1 ? "item" : "items"}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2">
          Only fields you fill in will be updated. Leave blank to keep existing
          values.
        </p>
        <div className="flex flex-col gap-4 py-2">
          {fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={`bulk-edit-${field.key}`}>{field.label}</Label>
              {field.type === "select" ? (
                <Select
                  value={values[field.key] ?? ""}
                  onValueChange={(val) =>
                    setValue(field.key, val === "__NOCHANGE__" ? "" : val)
                  }
                >
                  <SelectTrigger id={`bulk-edit-${field.key}`}>
                    <SelectValue placeholder="No change" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__NOCHANGE__">No change</SelectItem>
                    {field.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`bulk-edit-${field.key}`}
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "date"
                        ? "date"
                        : "text"
                  }
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValue(field.key, e.target.value)}
                  placeholder="No change"
                  {...(field.type === "number"
                    ? { min: field.min, step: field.step }
                    : {})}
                />
              )}
            </div>
          ))}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading
              ? "Saving..."
              : `Apply to ${selectedCount} ${selectedCount === 1 ? "item" : "items"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
