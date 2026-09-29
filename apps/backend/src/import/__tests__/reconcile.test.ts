import { describe, it, expect } from "vitest";
import type { Country, Grape, Region, WineMaker } from "@cellarboss/types";
import { countries as countryNames } from "../../seeds/001_countries.js";
import { grapes as grapeNames } from "../../seeds/002_grapes.js";
import { regionsByCountry } from "../../seeds/003_regions.js";
import { matchByName, reconcileWine, type ImportedWine } from "../index.js";
import { GRAPE_ALIASES } from "../normalise/aliases.js";

// The real seed lists, with ids in seed order.
const countries: Country[] = countryNames.map((name, i) => ({
  id: i + 1,
  name,
}));
const grapes: Grape[] = grapeNames.map((name, i) => ({ id: i + 1, name }));
const regions: Region[] = Object.entries(regionsByCountry)
  .flatMap(([country, names]) =>
    names.map((name) => ({
      name,
      countryId: countries.find((c) => c.name === country)!.id,
    })),
  )
  .map((region, i) => ({ id: i + 1, ...region }));
const winemakers: WineMaker[] = [
  { id: 1, name: "Château Cissac" },
  { id: 2, name: "Kobie & Faisal" },
  { id: 3, name: "Benjamin Darnault" },
];
const lookups = { countries, grapes, regions, winemakers };

const idOf = (list: { id: number; name: string }[], name: string) =>
  list.find((item) => item.name === name)!.id;

const wine = (
  fields: Partial<Record<"winemaker" | "country", string>> & {
    regions?: string[];
    grapes?: string[];
  },
): ImportedWine => {
  const extracted = <T>(value: T) => ({
    value,
    source: "site" as const,
    confidence: 0.9,
  });
  return {
    sourceUrl: "https://example.com",
    importerId: "generic",
    diagnostics: [],
    winemaker: fields.winemaker ? extracted(fields.winemaker) : undefined,
    country: fields.country ? extracted(fields.country) : undefined,
    regions: fields.regions ? extracted(fields.regions) : undefined,
    grapes: fields.grapes ? extracted(fields.grapes) : undefined,
  };
};

describe("matchByName", () => {
  it("is absent without a name", () => {
    expect(matchByName(undefined, grapes)).toEqual({ status: "absent" });
  });

  it("matches ignoring accents and case", () => {
    expect(matchByName("MOURVÈDRE", grapes)).toMatchObject({
      status: "matched",
      name: "Mourvedre",
    });
  });

  it("matches through aliases", () => {
    expect(
      matchByName("Shiraz", grapes, { aliases: GRAPE_ALIASES }),
    ).toMatchObject({
      status: "matched",
      name: "Syrah",
    });
  });

  it("suggests close names", () => {
    const result = matchByName("Cabernet Sauvingon", grapes);
    expect(result.status).toBe("suggested");
    if (result.status === "suggested") {
      expect(result.candidates[0].name).toBe("Cabernet Sauvignon");
      expect(result.candidates.length).toBeLessThanOrEqual(3);
    }
  });

  it("suggests typos and names that contain each other", () => {
    const firstSuggestion = (result: ReturnType<typeof matchByName>) =>
      result.status === "suggested" ? result.candidates[0].name : result.status;
    expect(firstSuggestion(matchByName("Pinot Nior", grapes))).toBe(
      "Pinot Noir",
    );
    expect(firstSuggestion(matchByName("Cissac", winemakers))).toBe(
      "Château Cissac",
    );
  });

  it("proposes a new record when nothing is close", () => {
    expect(matchByName("Xarel·lo", grapes)).toEqual({
      status: "new",
      proposedName: "Xarel·lo",
    });
  });
});

describe("reconcileWine", () => {
  it("matches retailer spellings against the seed data", () => {
    const result = reconcileWine(
      wine({
        winemaker: "By Kobie and Faisal",
        country: "Italy",
        regions: ["Toscana"],
        grapes: ["Sangiovese", "Shiraz"],
      }),
      lookups,
    );

    expect(result.winemaker).toMatchObject({ status: "matched", id: 2 });
    expect(result.country).toMatchObject({ status: "matched", name: "Italy" });
    expect(result.region).toMatchObject({ status: "matched", name: "Tuscany" });
    expect(result.grapes).toMatchObject([
      { status: "matched", name: "Sangiovese" },
      { status: "matched", name: "Syrah" },
    ]);
  });

  it("ignores estate words when matching winemakers", () => {
    const result = reconcileWine(
      wine({ winemaker: "Benjamin Darnault Wines" }),
      lookups,
    );
    expect(result.winemaker).toMatchObject({ status: "matched", id: 3 });
  });

  it("uses the most specific existing region", () => {
    const result = reconcileWine(
      wine({ country: "France", regions: ["Haut-Médoc", "Bordeaux"] }),
      lookups,
    );
    expect(result.region).toMatchObject({
      status: "matched",
      id: idOf(regions, "Bordeaux"),
    });
  });

  it("matches Rhône to Rhone Valley", () => {
    const result = reconcileWine(
      wine({ country: "France", regions: ["Rhône"] }),
      lookups,
    );
    expect(result.region).toMatchObject({
      status: "matched",
      name: "Rhone Valley",
    });
  });

  it("infers the country from a matched region", () => {
    const result = reconcileWine(
      wine({ regions: ["Margaux", "Bordeaux"] }),
      lookups,
    );
    expect(result.country).toMatchObject({ status: "matched", name: "France" });
  });

  it("never matches a region in the wrong country", () => {
    // Seeded under Spain, so a Portuguese wine must not match it.
    const result = reconcileWine(
      wine({ country: "Portugal", regions: ["Rioja"] }),
      lookups,
    );
    expect(result.region).toEqual({ status: "new", proposedName: "Rioja" });
  });

  it("makes every region new when the country is new", () => {
    const result = reconcileWine(
      wine({ country: "Atlantis", regions: ["Bordeaux"] }),
      lookups,
    );
    expect(result.country).toEqual({ status: "new", proposedName: "Atlantis" });
    expect(result.region).toEqual({ status: "new", proposedName: "Bordeaux" });
  });

  it("maps country aliases", () => {
    const result = reconcileWine(wine({ country: "USA" }), lookups);
    expect(result.country).toMatchObject({
      status: "matched",
      name: "United States",
    });
  });

  it("collapses grapes that match the same record", () => {
    const result = reconcileWine(
      wine({ grapes: ["Syrah", "Shiraz"] }),
      lookups,
    );
    expect(result.grapes).toHaveLength(1);
  });
});
