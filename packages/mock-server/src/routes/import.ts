import type { Hono } from "hono";
import type {
  ImportedWineDetails,
  ImportEntityRef,
  ImportResolution,
} from "@cellarboss/types";
import type { MockState } from "../index";
import { nextId } from "../ids";
import {
  importCommitSchema,
  importPreviewSchema,
} from "@cellarboss/validators";

const field = <T>(value: T, confidence = 0.9) => ({
  value,
  source: "json-ld" as const,
  confidence,
});

/**
 * Canned pages the preview answers for, keyed by a word in the URL. Any other
 * URL, and any URL containing "fail", gets the generic IMPORT_FAILED error.
 */
const CANNED: Record<string, Omit<ImportedWineDetails, "sourceUrl">> = {
  margaux: {
    importerId: "generic",
    title: field("Château Example Margaux 2015"),
    name: field("Margaux"),
    type: field("red" as const),
    winemaker: field("Château Example"),
    country: field("France"),
    regions: field(["Margaux", "Bordeaux"]),
    grapes: field(["Cabernet Sauvignon", "Merlot"], 0.8),
    vintage: {
      year: field(2015),
      drinkFrom: field(2022, 0.7),
      drinkUntil: field(2040, 0.7),
    },
  },
  "partial-rose": {
    importerId: "generic",
    title: field("House Rosé"),
    name: field("House Rosé", 0.5),
    type: field("rose" as const, 0.6),
  },
};

const fold = (s: string) =>
  s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();

function resolve(
  name: string | undefined,
  rows: { id: number; name: string }[],
): ImportResolution {
  if (!name) return { status: "absent" };
  const match = rows.find((r) => fold(r.name) === fold(name));
  return match
    ? { status: "matched", id: match.id, name: match.name, score: 1 }
    : { status: "new", proposedName: name };
}

export function registerImportRoutes(app: Hono, state: MockState) {
  app.get("/api/import/sites", (c) =>
    c.json([
      {
        id: "thewinesociety",
        label: "The Wine Society",
        hosts: ["thewinesociety.com"],
      },
      {
        id: "nakedwines",
        label: "Naked Wines",
        hosts: ["nakedwines.co.uk", "nakedwines.com"],
      },
      { id: "vivino", label: "Vivino", hosts: ["vivino.com"] },
    ]),
  );

  app.post("/api/import/preview", async (c) => {
    const result = importPreviewSchema.safeParse(await c.req.json());
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const { url } = result.data;
    const key = Object.keys(CANNED).find((k) => url.includes(k));
    if (!key || url.includes("fail")) {
      return c.json({ error: "IMPORT_FAILED" }, 422);
    }
    const wine = { ...CANNED[key], sourceUrl: url };

    const winemaker = resolve(wine.winemaker?.value, state.winemakers);
    const country = resolve(wine.country?.value, state.countries);
    const region = resolve(wine.regions?.value[0], state.regions);
    const grapes = (wine.grapes?.value ?? []).map((g) =>
      resolve(g, state.grapes),
    );

    const existingWine =
      winemaker.status === "matched" && wine.name
        ? (state.wines.find(
            (w) =>
              w.wineMakerId === winemaker.id &&
              fold(w.name) === fold(wine.name!.value),
          ) ?? null)
        : null;
    const year = wine.vintage?.year?.value;
    const existingVintage =
      existingWine && year !== undefined
        ? (state.vintages.find(
            (v) => v.wineId === existingWine.id && v.year === year,
          ) ?? null)
        : null;

    return c.json({
      wine,
      resolution: { winemaker, country, region, grapes },
      existing: {
        wine: existingWine && { id: existingWine.id, name: existingWine.name },
        vintage: existingVintage && {
          id: existingVintage.id,
          year: existingVintage.year,
        },
      },
    });
  });

  app.post("/api/import/commit", async (c) => {
    const result = importCommitSchema.safeParse(await c.req.json());
    if (!result.success) return c.json({ error: result.error.issues }, 400);
    const input = result.data;

    const named = (
      rows: { id: number; name: string }[],
      ref: ImportEntityRef,
      create: (name: string) => { id: number; name: string },
    ): number | null => {
      if ("id" in ref) return rows.find((r) => r.id === ref.id)?.id ?? null;
      return (
        rows.find((r) => fold(r.name) === fold(ref.name))?.id ??
        create(ref.name).id
      );
    };

    let wineId: number;
    if ("id" in input.wine) {
      const wine = state.wines.find(
        (w) => w.id === (input.wine as { id: number }).id,
      );
      if (!wine) return c.json({ error: "wine not found" }, 404);
      wineId = wine.id;
    } else {
      const w = input.wine;
      const wineMakerId = named(state.winemakers, w.winemaker, (name) => {
        const row = { id: nextId(state.winemakers), name };
        state.winemakers.push(row);
        return row;
      });
      const countryId = w.country
        ? named(state.countries, w.country, (name) => {
            const row = { id: nextId(state.countries), name };
            state.countries.push(row);
            return row;
          })
        : null;
      let regionId: number | null = null;
      if (w.region) {
        if (!("id" in w.region) && countryId === null) {
          return c.json({ error: "A new region needs a country" }, 400);
        }
        regionId = named(state.regions, w.region, (name) => {
          const row = {
            id: nextId(state.regions),
            name,
            countryId: countryId!,
          };
          state.regions.push(row);
          return row;
        });
      }
      const grapeIds = w.grapes.map((g) =>
        named(state.grapes, g, (name) => {
          const row = { id: nextId(state.grapes), name };
          state.grapes.push(row);
          return row;
        }),
      );
      if (
        wineMakerId === null ||
        grapeIds.includes(null) ||
        (w.region && regionId === null)
      ) {
        return c.json({ error: "Referenced record not found" }, 404);
      }

      const existing = state.wines.find(
        (x) => x.wineMakerId === wineMakerId && fold(x.name) === fold(w.name),
      );
      if (existing) {
        wineId = existing.id;
      } else {
        wineId = nextId(state.wines);
        state.wines.push({
          id: wineId,
          name: w.name,
          type: w.type,
          wineMakerId,
          regionId,
        });
        for (const grapeId of new Set(grapeIds as number[])) {
          state.wineGrapes.push({
            id: nextId(state.wineGrapes),
            wineId,
            grapeId,
          });
        }
      }
    }

    const { year, drinkFrom, drinkUntil } = input.vintage;
    const vintage = state.vintages.find(
      (v) => v.wineId === wineId && v.year === year,
    );
    if (vintage)
      return c.json({ wineId, vintageId: vintage.id, created: false });
    const vintageId = nextId(state.vintages);
    state.vintages.push({ id: vintageId, wineId, year, drinkFrom, drinkUntil });
    return c.json({ wineId, vintageId, created: true });
  });
}
