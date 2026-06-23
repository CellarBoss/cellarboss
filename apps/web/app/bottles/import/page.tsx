"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type { WineType } from "@cellarboss/validators/constants";
import {
  BOTTLE_SIZES,
  BOTTLE_STATUSES,
  WINE_TYPES,
} from "@cellarboss/validators/constants";
import type { Bottle, GenericType } from "@cellarboss/types";
import { scrapeUrl, createFromDraft } from "@/lib/import/actions";
import { SUPPORTED_SITE_LABELS } from "@/lib/import/sites";
import type {
  ImportDraft,
  ReconciledImport,
  ResolvedEntity,
} from "@/lib/import/types";
import { getCountries } from "@/lib/api/countries";
import { getRegions } from "@/lib/api/regions";
import { getWinemakers } from "@/lib/api/winemakers";
import { getGrapes } from "@/lib/api/grapes";
import { getStorages } from "@/lib/api/storages";
import { getWines } from "@/lib/api/wines";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import {
  formatBottleSize,
  formatStatus,
  formatWineType,
} from "@/lib/functions/format";
import { formatDateOnly } from "@/lib/functions/date";
import { PageHeader } from "@/components/page/PageHeader";
import { EntityResolver } from "@/components/import/EntityResolver";
import { GrapeMultiSelect } from "@/components/import/GrapeMultiSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormState = {
  createNewWine: boolean;
  existingWineId: number | null;
  wineName: string;
  wineType: WineType;
  winemaker: ResolvedEntity;
  country: ResolvedEntity;
  region: ResolvedEntity;
  grapes: ResolvedEntity[];
  year: string;
  drinkFrom: string;
  drinkUntil: string;
  purchaseDate: string;
  purchasePrice: string;
  storageId: string;
  status: Bottle["status"];
  size: Bottle["size"];
  quantity: string;
};

const NONE = "__none__";

/** Capacity in millilitres for each known bottle size. */
const BOTTLE_SIZE_ML: Record<Bottle["size"], number> = {
  piccolo: 187,
  half: 375,
  standard: 750,
  litre: 1000,
  magnum: 1500,
  "double-magnum": 3000,
  jeroboam: 4500,
  imperial: 6000,
  salmanazar: 9000,
  balthazar: 12000,
  nebuchadnezzar: 15000,
};

/** Map a scraped volume in millilitres to the closest known bottle size. */
function bottleSizeFromMl(ml: number | null): Bottle["size"] {
  if (ml == null) return "standard";
  let best: Bottle["size"] = "standard";
  let bestDiff = Infinity;
  for (const size of BOTTLE_SIZES) {
    const diff = Math.abs(BOTTLE_SIZE_ML[size] - ml);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = size;
    }
  }
  return best;
}

function resolvedFrom(
  matchId: number | null,
  scraped: string | null,
): ResolvedEntity {
  if (matchId != null) return { existingId: matchId, newName: null };
  if (scraped) return { existingId: null, newName: scraped };
  return { existingId: null, newName: null };
}

function buildInitialForm(draft: ImportDraft): FormState {
  const { scraped, suggestions } = draft;
  return {
    createNewWine: suggestions.wineId == null,
    existingWineId: suggestions.wineId,
    wineName: scraped.name,
    wineType: scraped.type ?? "red",
    winemaker: resolvedFrom(suggestions.winemakerId, scraped.winemaker),
    country: resolvedFrom(suggestions.countryId, scraped.country),
    region: resolvedFrom(suggestions.regionId, scraped.region),
    grapes: scraped.grapes.map((g, i) =>
      resolvedFrom(suggestions.grapeIds[i] ?? null, g),
    ),
    year: scraped.vintageYear?.toString() ?? "",
    drinkFrom: "",
    drinkUntil: "",
    purchaseDate: formatDateOnly(new Date()),
    purchasePrice: scraped.price != null ? String(scraped.price) : "0",
    storageId: NONE,
    status: "ordered",
    size: bottleSizeFromMl(scraped.volumeMl),
    quantity: "1",
  };
}

function normalise(entity: ResolvedEntity): ResolvedEntity | null {
  if (entity.existingId != null)
    return { existingId: entity.existingId, newName: null };
  if (entity.newName && entity.newName.trim()) {
    return { existingId: null, newName: entity.newName.trim() };
  }
  return null;
}

function toIntOrNull(value: string): number | null {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

export default function ImportBottlePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ImportDraft | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const countryQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });
  const grapeQuery = useApiQuery({ queryKey: ["grapes"], queryFn: getGrapes });
  const storageQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });
  const wineQuery = useApiQuery({ queryKey: ["wines"], queryFn: getWines });

  const gate = queryGate([
    countryQuery,
    regionQuery,
    winemakerQuery,
    grapeQuery,
    storageQuery,
    wineQuery,
  ]);
  if (!gate.ready) return gate.gate;
  const [countries, regions, winemakers, grapes, storages, wines] = gate.data;

  async function handleScrape() {
    setScraping(true);
    setScrapeError(null);
    const result = await scrapeUrl(url);
    setScraping(false);
    if (!result.ok) {
      setScrapeError(result.error.message);
      return;
    }
    setDraft(result.data);
    setForm(buildInitialForm(result.data));
  }

  function update(patch: Partial<FormState>) {
    setForm((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  async function handleSubmit() {
    if (!form) return;
    setSubmitting(true);
    setSubmitError(null);

    const region = normalise(form.region);
    const payload: ReconciledImport = {
      existingWineId: form.createNewWine ? null : form.existingWineId,
      wine: { name: form.wineName.trim(), type: form.wineType },
      winemaker: normalise(form.winemaker),
      country: region?.newName != null ? normalise(form.country) : null,
      region,
      grapes: form.grapes
        .map(normalise)
        .filter((g): g is ResolvedEntity => g != null),
      vintage: {
        year: toIntOrNull(form.year),
        drinkFrom: toIntOrNull(form.drinkFrom),
        drinkUntil: toIntOrNull(form.drinkUntil),
      },
      bottle: {
        purchaseDate: form.purchaseDate,
        purchasePrice: Number(form.purchasePrice) || 0,
        storageId: form.storageId === NONE ? null : Number(form.storageId),
        status: form.status,
        size: form.size,
        quantity: Math.max(1, Number(form.quantity) || 1),
      },
    };

    const result = await createFromDraft(payload);
    setSubmitting(false);
    if (!result.ok) {
      setSubmitError(result.error.message);
      return;
    }
    // Refresh the lists the new records belong to.
    for (const key of [
      "bottles",
      "vintages",
      "wines",
      "winemakers",
      "regions",
      "countries",
      "grapes",
    ]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
    router.push("/bottles");
  }

  return (
    <section className="flex flex-col gap-6 max-w-3xl">
      <PageHeader title="Import Bottle from URL" />

      <Card>
        <CardHeader>
          <CardTitle>Wine page URL</CardTitle>
          <CardDescription>
            Paste a product page from {SUPPORTED_SITE_LABELS.join(" or ")}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.thewinesociety.com/product/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url && !scraping) handleScrape();
              }}
            />
            <Button onClick={handleScrape} disabled={!url || scraping}>
              {scraping ? "Reading…" : "Fetch"}
            </Button>
          </div>
          {scrapeError && (
            <p className="text-sm text-destructive">{scrapeError}</p>
          )}
        </CardContent>
      </Card>

      {draft && form && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Wine</CardTitle>
              <CardDescription>
                Imported from {draft.adapterLabel}. Review matches against your
                cellar — green means an existing record was found.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Existing wine</Label>
                <Select
                  value={
                    form.createNewWine ? "__new__" : `id:${form.existingWineId}`
                  }
                  onValueChange={(v) =>
                    v === "__new__"
                      ? update({ createNewWine: true })
                      : update({
                          createNewWine: false,
                          existingWineId: Number(v.slice(3)),
                        })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__new__">
                      ➕ Create a new wine
                    </SelectItem>
                    {(wines as GenericType[]).map((w) => (
                      <SelectItem key={w.id} value={`id:${w.id}`}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.createNewWine && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="wineName">Name</Label>
                    <Input
                      id="wineName"
                      value={form.wineName}
                      onChange={(e) => update({ wineName: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label>Type</Label>
                    <Select
                      value={form.wineType}
                      onValueChange={(v) => update({ wineType: v as WineType })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WINE_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {formatWineType(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <EntityResolver
                    label="Winemaker"
                    scrapedValue={draft.scraped.winemaker}
                    entities={winemakers as GenericType[]}
                    value={form.winemaker}
                    onChange={(v) => update({ winemaker: v })}
                  />
                  <EntityResolver
                    label="Country"
                    scrapedValue={draft.scraped.country}
                    entities={countries as GenericType[]}
                    value={form.country}
                    onChange={(v) => update({ country: v })}
                    allowNone
                  />
                  <EntityResolver
                    label="Region"
                    scrapedValue={draft.scraped.region}
                    entities={regions as GenericType[]}
                    value={form.region}
                    onChange={(v) => update({ region: v })}
                    allowNone
                  />

                  <GrapeMultiSelect
                    entities={grapes as GenericType[]}
                    value={form.grapes}
                    onChange={(v) => update({ grapes: v })}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vintage</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="Non-vintage"
                  value={form.year}
                  onChange={(e) => update({ year: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drinkFrom">Drink from</Label>
                <Input
                  id="drinkFrom"
                  type="number"
                  value={form.drinkFrom}
                  onChange={(e) => update({ drinkFrom: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drinkUntil">Drink until</Label>
                <Input
                  id="drinkUntil"
                  type="number"
                  value={form.drinkUntil}
                  onChange={(e) => update({ drinkUntil: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bottle(s)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="purchaseDate">Purchase date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => update({ purchaseDate: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="purchasePrice">Purchase price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.purchasePrice}
                  onChange={(e) => update({ purchasePrice: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Storage</Label>
                <Select
                  value={form.storageId}
                  onValueChange={(v) => update({ storageId: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {(storages as GenericType[]).map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    update({ status: v as Bottle["status"] })
                  }
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
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Size</Label>
                <Select
                  value={form.size}
                  onValueChange={(v) => update({ size: v as Bottle["size"] })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOTTLE_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatBottleSize(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  value={form.quantity}
                  onChange={(e) => update({ quantity: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/bottles")}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Importing…" : "Import"}
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
