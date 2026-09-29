import { describe, it, expect } from "vitest";
import { cleanText, foldKey, splitList } from "../normalise/text.js";
import { toWineType } from "../normalise/wine-type.js";
import { parseVintage } from "../normalise/vintage.js";
import { parseDrinkingWindow } from "../normalise/drinking-window.js";
import { parseBottleSize, parsePrice } from "../normalise/bottle.js";
import { splitGrapes } from "../normalise/grapes.js";
import { deriveWineName } from "../normalise/wine-name.js";

const YEAR = 2026;

describe("text", () => {
  it("cleans whitespace and composes accents", () => {
    expect(cleanText("  Château \n Cissac  ")).toBe("Château Cissac");
  });

  it.each([
    ["Rhône Valley", "rhone valley"],
    ["By Kobie & Faisal", "kobie and faisal"],
    ["Kobie and Faisal", "kobie and faisal"],
    ["Ch. Cissac", "chateau cissac"],
    ["Nero d'Avola", "nero davola"],
    ["Côtes-du-Rhône", "cotes du rhone"],
  ])("folds %s to %s", (input, expected) => {
    expect(foldKey(input)).toBe(expected);
  });

  it("splits region lists", () => {
    expect(splitList("Haut-Médoc, Bordeaux")).toEqual([
      "Haut-Médoc",
      "Bordeaux",
    ]);
    expect(splitList("France > Bordeaux")).toEqual(["France", "Bordeaux"]);
  });
});

describe("toWineType", () => {
  it.each([
    ["Red", "red"],
    ["Rosé", "rose"],
    ["Tuscan Red", "red"],
    ["Sparkling white", "sparkling"],
    ["Sparkling Rosé", "sparkling"],
    ["Champagne", "sparkling"],
    ["Tawny Port", "fortified"],
    ["Sauternes", "dessert"],
    ["Blanc", "white"],
  ] as const)("maps %s to %s", (input, expected) => {
    expect(toWineType(input)).toBe(expected);
  });

  it("returns undefined for unknown styles", () => {
    expect(toWineType("Full-bodied")).toBeUndefined();
  });
});

describe("parseVintage", () => {
  it("reads a year from text", () => {
    expect(parseVintage("Château Cissac 2018", YEAR)).toBe(2018);
  });

  it("treats NV as null", () => {
    expect(parseVintage("NV", YEAR)).toBeNull();
    expect(parseVintage("Non-Vintage", YEAR)).toBeNull();
  });

  it("ignores implausible years", () => {
    expect(parseVintage("Established 1066", YEAR)).toBeUndefined();
    expect(parseVintage("2099", YEAR)).toBeUndefined();
  });
});

describe("parseDrinkingWindow", () => {
  it.each([
    ["Now to 2033", { from: 2026, until: 2033 }],
    ["Now – 2033", { from: 2026, until: 2033 }],
    ["2026-2030", { from: 2026, until: 2030 }],
    ["Maturity 2023–2038", { from: 2023, until: 2038 }],
    ["Drink from 2027", { from: 2027 }],
    ["Drink until 2030", { until: 2030 }],
    ["Drink now", { from: 2026 }],
    ["Ready", {}],
  ])("reads %s", (input, expected) => {
    expect(parseDrinkingWindow(input, YEAR)).toEqual(expected);
  });
});

describe("parseBottleSize", () => {
  it.each([
    ["75cl", "standard"],
    ["75 cl", "standard"],
    ["0,75 l", "standard"],
    ["750ml", "standard"],
    ["1.5L", "magnum"],
    ["Magnum", "magnum"],
    ["Half bottle", "half"],
    ["37.5cl", "half"],
    ["3 litre", "double-magnum"],
  ] as const)("reads %s as %s", (input, expected) => {
    expect(parseBottleSize(input)).toBe(expected);
  });

  it("returns undefined for unknown sizes", () => {
    expect(parseBottleSize("50cl")).toBeUndefined();
  });
});

describe("parsePrice", () => {
  it.each([
    ["£12.50", undefined, { amount: 12.5, currency: "GBP" }],
    ["12,50 €", undefined, { amount: 12.5, currency: "EUR" }],
    ["1.234,56", "EUR", { amount: 1234.56, currency: "EUR" }],
    ["1,234.56", "usd", { amount: 1234.56, currency: "USD" }],
    ["45", undefined, { amount: 45, currency: null }],
    ["12.5", undefined, { amount: 12.5, currency: null }],
    ["1.234", undefined, { amount: 1234, currency: null }],
    ["AUD $24.99", undefined, { amount: 24.99, currency: "AUD" }],
  ])("reads %s", (input, currency, expected) => {
    expect(parsePrice(input, currency)).toEqual(expected);
  });
});

describe("splitGrapes", () => {
  it("drops percentages", () => {
    expect(splitGrapes("70% Merlot, Cabernet Sauvignon (30%)")).toEqual([
      "Merlot",
      "Cabernet Sauvignon",
    ]);
  });

  it("splits on and, slashes and ampersands", () => {
    expect(splitGrapes("Grenache/Syrah & Mourvèdre and Cinsault")).toEqual([
      "Grenache",
      "Syrah",
      "Mourvèdre",
      "Cinsault",
    ]);
  });

  it("dedupes arrays", () => {
    expect(splitGrapes(["Merlot", "Merlot 60%"])).toEqual(["Merlot"]);
  });
});

describe("deriveWineName", () => {
  it("removes the producer and vintage", () => {
    expect(
      deriveWineName("Château Cissac, Haut-Médoc 2018", {
        winemaker: "Château Cissac",
        year: 2018,
      }),
    ).toBe("Haut-Médoc");
  });

  it("matches the producer without accents or abbreviations", () => {
    expect(
      deriveWineName("Ch. Cissac Haut-Medoc 2018", {
        winemaker: "Château Cissac",
        year: 2018,
      }),
    ).toBe("Haut-Medoc");
  });

  it("removes a 'by' credit and size text", () => {
    expect(
      deriveWineName("Angel Cuvée 2024 by Kobie and Faisal 75cl", {
        winemaker: "Kobie & Faisal",
        year: 2024,
      }),
    ).toBe("Angel Cuvée");
  });

  it("removes pack text", () => {
    expect(
      deriveWineName("Example Rioja Reserva 2019 (6 x 75cl)", { year: 2019 }),
    ).toBe("Example Rioja Reserva");
  });

  it("keeps the title when the producer is the whole name", () => {
    expect(
      deriveWineName("Château Cissac", { winemaker: "Château Cissac" }),
    ).toBe("Château Cissac");
  });

  it("removes NV", () => {
    expect(deriveWineName("House Champagne Brut NV", { year: null })).toBe(
      "House Champagne Brut",
    );
  });
});
