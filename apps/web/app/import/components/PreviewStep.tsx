"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GenericType, Storage } from "@cellarboss/types";
import type { WineType, BottleStatus } from "@cellarboss/validators/constants";
import { BOTTLE_STATUSES, WINE_TYPES } from "@cellarboss/validators/constants";
import { importBottles } from "@/lib/api/import";
import type { ImportFormState, EntityValue, ImportPreview } from "@/lib/api/import";
import { EntityCombobox, MultiEntityCombobox } from "./EntityCombobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HierarchicalSingleSelector from "@/components/selector/HierarchicalSingleSelector";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatStatus(s: BottleStatus) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ");
}

// Adapts a plain state value to the shape HierarchicalSingleSelector expects
function makeStorageField(value: number | null, onChange: (id: number | null) => void) {
  return {
    state: { value: value?.toString() ?? "", meta: { isTouched: false, isValid: true } },
    handleChange: (v: string) => onChange(v ? Number(v) : null),
  };
}

// ── FormRow ───────────────────────────────────────────────────────────────────

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[160px_1fr] items-start gap-x-4 gap-y-1 py-2 border-b last:border-0">
      <span className="text-sm font-medium text-muted-foreground pt-2">{label}</span>
      <div>{children}</div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mt-6 mb-1 first:mt-0">
      {children}
    </h3>
  );
}

// ── PreviewStep ───────────────────────────────────────────────────────────────

type PreviewStepProps = {
  preview: ImportPreview;
  winemakers: GenericType[];
  countries: GenericType[];
  regions: GenericType[];
  grapes: GenericType[];
  storages: Storage[];
  onBack: () => void;
};

export function PreviewStep({
  preview,
  winemakers,
  countries,
  regions,
  grapes,
  storages,
  onBack,
}: PreviewStepProps) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState<ImportFormState>({
    ...preview,
    quantity: 1,
    purchaseDate: today,
    storageId: null,
    status: "ordered",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ImportFormState>(key: K, value: ImportFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleImport() {
    if (!form.winemaker) {
      setError("Winemaker is required before importing.");
      return;
    }
    if (!form.wineName.trim()) {
      setError("Wine name is required.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const result = await importBottles(form);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      router.push("/bottles");
    } finally {
      setLoading(false);
    }
  }

  const newEntityCount = [
    form.winemaker?.type === "new" ? 1 : 0,
    form.country?.type === "new" ? 1 : 0,
    form.region?.type === "new" ? 1 : 0,
    ...form.grapes.map((g) => (g.type === "new" ? 1 : 0)),
  ].reduce((a, b) => a + b, 0) as number;

  return (
    <div className="flex flex-col gap-4">
      {newEntityCount > 0 && (
        <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          <strong>{newEntityCount} new {newEntityCount === 1 ? "entity" : "entities"}</strong> will be
          created on import. Review the fields marked <span className="font-semibold">New</span> below.
        </div>
      )}

      <div className="border rounded-lg p-4 bg-white">
        <SectionHeading>Wine details</SectionHeading>

        <FormRow label="Wine name">
          <Input
            value={form.wineName}
            onChange={(e) => update("wineName", e.target.value)}
            placeholder="Wine name"
          />
        </FormRow>

        <FormRow label="Vintage year">
          <Input
            type="number"
            value={form.year?.toString() ?? ""}
            onChange={(e) => update("year", e.target.value ? parseInt(e.target.value, 10) : null)}
            placeholder="e.g. 2022"
            min={1800}
            max={new Date().getFullYear() + 2}
          />
        </FormRow>

        <FormRow label="Wine type">
          <Select
            value={form.wineType ?? ""}
            onValueChange={(v) => update("wineType", v as WineType || null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {WINE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>

        <FormRow label="Price per bottle">
          <Input
            type="number"
            value={form.pricePerBottle?.toString() ?? ""}
            onChange={(e) =>
              update("pricePerBottle", e.target.value ? parseFloat(e.target.value) : null)
            }
            placeholder="0.00"
            min={0}
            step={0.01}
          />
        </FormRow>

        <SectionHeading>Producer &amp; origin</SectionHeading>

        <FormRow label="Winemaker">
          <EntityCombobox
            label="Winemaker"
            value={form.winemaker}
            onChange={(v) => update("winemaker", v)}
            entities={winemakers}
            nullable={false}
            placeholder="Select or create winemaker..."
          />
        </FormRow>

        <FormRow label="Country">
          <EntityCombobox
            label="Country"
            value={form.country}
            onChange={(v) => update("country", v)}
            entities={countries}
            placeholder="Select or create country..."
          />
        </FormRow>

        <FormRow label="Region">
          <EntityCombobox
            label="Region"
            value={form.region}
            onChange={(v) => update("region", v)}
            entities={regions}
            placeholder="Select or create region..."
          />
        </FormRow>

        <FormRow label="Grapes">
          <MultiEntityCombobox
            label="Grapes"
            values={form.grapes}
            onChange={(v: EntityValue[]) => update("grapes", v)}
            entities={grapes}
          />
        </FormRow>

        <SectionHeading>Bottle details</SectionHeading>

        <FormRow label="Quantity">
          <Input
            type="number"
            value={form.quantity.toString()}
            onChange={(e) => update("quantity", Math.max(1, parseInt(e.target.value, 10) || 1))}
            min={1}
            step={1}
          />
        </FormRow>

        <FormRow label="Purchase date">
          <Input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => update("purchaseDate", e.target.value)}
          />
        </FormRow>

        <FormRow label="Storage">
          <HierarchicalSingleSelector
            options={storages}
            isInvalid={false}
            editable={true}
            field={makeStorageField(form.storageId, (id) => update("storageId", id))}
          />
        </FormRow>

        <FormRow label="Status">
          <Select
            value={form.status}
            onValueChange={(v) => update("status", v as BottleStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOTTLE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {formatStatus(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormRow>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" type="button" onClick={onBack} disabled={loading}>
          ← Back
        </Button>
        <Button type="button" onClick={handleImport} disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Importing...
            </span>
          ) : (
            `Import ${form.quantity} ${form.quantity === 1 ? "bottle" : "bottles"}`
          )}
        </Button>
      </div>
    </div>
  );
}
