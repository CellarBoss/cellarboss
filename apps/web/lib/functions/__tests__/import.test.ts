import { describe, it, expect } from "vitest";
import type { ImportPreview } from "@cellarboss/types";
import {
  buildCommit,
  EMPTY_IMPORT_FORM,
  fieldStatus,
  formValuesFromPreview,
  grapesResetTarget,
  pendingName,
  pendingValue,
  resetTarget,
  toRef,
  valueFor,
} from "../import";

const field = <T>(value: T) => ({
  value,
  source: "json-ld" as const,
  confidence: 0.9,
});

const preview: ImportPreview = {
  wine: {
    sourceUrl: "https://shop.example.com/margaux",
    importerId: "generic",
    name: field("Margaux"),
    type: field("red"),
    vintage: { year: field(2015), drinkUntil: field(2040) },
  },
  resolution: {
    winemaker: { status: "new", proposedName: "Château Example" },
    country: { status: "matched", id: 1, name: "France", score: 1 },
    region: {
      status: "suggested",
      proposedName: "Bordeaux Supérieur",
      candidates: [{ id: 4, name: "Bordeaux", score: 0.3 }],
    },
    grapes: [
      { status: "matched", id: 2, name: "Merlot", score: 1 },
      { status: "matched", id: 2, name: "Merlot", score: 1 },
      { status: "new", proposedName: "Petit Verdot" },
    ],
  },
  existing: { wine: null, vintage: null },
};

describe("pending values", () => {
  it("round-trips a new name", () => {
    expect(pendingName(pendingValue(" Syrah "))).toBe("Syrah");
  });

  it("is null for ids and empty values", () => {
    expect(pendingName("12")).toBeNull();
    expect(pendingName("")).toBeNull();
    expect(pendingName(undefined)).toBeNull();
  });
});

describe("valueFor", () => {
  it("uses the top candidate for a close match", () => {
    expect(valueFor(preview.resolution.region)).toBe("4");
  });

  it("is empty when the page gave nothing", () => {
    expect(valueFor({ status: "absent" })).toBe("");
  });
});

describe("formValuesFromPreview", () => {
  it("fills the form from the preview", () => {
    expect(formValuesFromPreview(preview)).toEqual({
      name: "Margaux",
      type: "red",
      wineMakerId: "new:Château Example",
      countryId: "1",
      regionId: "4",
      grapeIds: ["2", "new:Petit Verdot"],
      year: "2015",
      drinkFrom: "",
      drinkUntil: "2040",
    });
  });

  it("leaves a non-vintage year empty", () => {
    const nv = {
      ...preview,
      wine: { ...preview.wine, vintage: { year: field(null) } },
    };
    expect(formValuesFromPreview(nv).year).toBe("");
  });
});

describe("toRef", () => {
  it("maps ids, new names and empty values", () => {
    expect(toRef("3")).toEqual({ id: 3 });
    expect(toRef("new:Syrah")).toEqual({ name: "Syrah" });
    expect(toRef("")).toBeNull();
  });
});

describe("buildCommit", () => {
  it("builds a new wine and vintage", () => {
    expect(buildCommit(formValuesFromPreview(preview))).toEqual({
      wine: {
        name: "Margaux",
        type: "red",
        winemaker: { name: "Château Example" },
        country: { id: 1 },
        region: { id: 4 },
        grapes: [{ id: 2 }, { name: "Petit Verdot" }],
      },
      vintage: { year: 2015, drinkFrom: null, drinkUntil: 2040 },
    });
  });

  it("adds only the vintage to an existing wine", () => {
    expect(buildCommit(formValuesFromPreview(preview), 7)).toEqual({
      wine: { id: 7 },
      vintage: { year: 2015, drinkFrom: null, drinkUntil: 2040 },
    });
  });

  it("needs a winemaker for a new wine", () => {
    expect(() => buildCommit({ ...EMPTY_IMPORT_FORM, type: "red" })).toThrow(
      "winemaker",
    );
  });
});

describe("fieldStatus", () => {
  const { country, region } = preview.resolution;

  it("reports a match while the matched record is selected", () => {
    expect(fieldStatus(country, "1")).toEqual({ kind: "matched" });
    expect(fieldStatus(country, "9")).toBeNull();
  });

  it("offers the new name for a close match", () => {
    expect(fieldStatus(region, "4")).toEqual({
      kind: "suggested",
      proposedName: "Bordeaux Supérieur",
    });
  });

  it("reports a pending record as new", () => {
    expect(fieldStatus(undefined, "new:Syrah")).toEqual({ kind: "new" });
  });
});

describe("resetTarget", () => {
  const { winemaker, country, region } = preview.resolution;

  it("is null while the value is the import's", () => {
    expect(resetTarget(country, "1")).toBeNull();
    expect(resetTarget(region, "4")).toBeNull();
    expect(resetTarget(winemaker, pendingValue("Château Example"))).toBeNull();
  });

  it("offers the import's record once the value changes", () => {
    expect(resetTarget(country, "7")).toEqual({ value: "1", name: "France" });
    expect(resetTarget(country, "")).toEqual({ value: "1", name: "France" });
    expect(resetTarget(winemaker, "3")).toEqual({
      value: pendingValue("Château Example"),
      name: "Château Example",
    });
  });

  it("offers the close match back after creating the new name instead", () => {
    expect(resetTarget(region, pendingValue("Bordeaux Supérieur"))).toEqual({
      value: "4",
      name: "Bordeaux",
    });
  });

  it("is null when the import had nothing", () => {
    expect(resetTarget(undefined, "3")).toBeNull();
    expect(resetTarget({ status: "absent" }, "3")).toBeNull();
  });
});

describe("grapesResetTarget", () => {
  const { grapes } = preview.resolution;
  const original = ["2", pendingValue("Petit Verdot")];

  it("is null while the grapes are the import's, in any order", () => {
    expect(grapesResetTarget(grapes, original)).toBeNull();
    expect(grapesResetTarget(grapes, [...original].reverse())).toBeNull();
  });

  it("offers the import's grapes once they change", () => {
    expect(grapesResetTarget(grapes, ["2"])).toEqual({
      values: original,
      names: ["Merlot", "Petit Verdot"],
    });
    expect(grapesResetTarget(grapes, [...original, "9"])).not.toBeNull();
  });

  it("is null when the import found no grapes", () => {
    expect(grapesResetTarget([], ["9"])).toBeNull();
  });
});
