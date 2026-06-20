import { describe, expect, it } from "vitest";
import {
  asWineType,
  cleanText,
  comparableName,
  finaliseScrapedWine,
  guessWineType,
  parsePrice,
  parseVintageYear,
  parseVolumeMl,
} from "../scrape/normalize";

describe("cleanText", () => {
  it("collapses whitespace and trims", () => {
    expect(cleanText("  Château   Coufran \n")).toBe("Château Coufran");
  });

  it("returns null for empty / nullish input", () => {
    expect(cleanText("   ")).toBeNull();
    expect(cleanText(null)).toBeNull();
    expect(cleanText(undefined)).toBeNull();
  });
});

describe("comparableName", () => {
  it("strips accents, case and punctuation", () => {
    expect(comparableName("Château Coufran")).toBe("chateau coufran");
    expect(comparableName("Côtes-du-Rhône")).toBe("cotes du rhone");
  });
});

describe("parseVintageYear", () => {
  it("extracts a plausible year", () => {
    expect(parseVintageYear("Château Coufran 2016")).toBe(2016);
  });

  it("ignores non-vintage wines", () => {
    expect(parseVintageYear("Champagne Brut NV")).toBeNull();
    expect(parseVintageYear("Non-Vintage Fizz")).toBeNull();
  });

  it("ignores out-of-range numbers", () => {
    expect(parseVintageYear("Lot 12345")).toBeNull();
  });
});

describe("parseVolumeMl", () => {
  it("handles cl, ml and litres", () => {
    expect(parseVolumeMl("75cl")).toBe(750);
    expect(parseVolumeMl("750 ml")).toBe(750);
    expect(parseVolumeMl("1.5L")).toBe(1500);
    expect(parseVolumeMl("1,5 litre")).toBe(1500);
  });

  it("returns null when no volume present", () => {
    expect(parseVolumeMl("a lovely red")).toBeNull();
  });
});

describe("parsePrice", () => {
  it("strips currency symbols and thousands separators", () => {
    expect(parsePrice("£19.50")).toBe(19.5);
    expect(parsePrice("1,299.00")).toBe(1299);
    expect(parsePrice("12,99 €")).toBe(12.99);
  });
});

describe("guessWineType / asWineType", () => {
  it("guesses from keywords", () => {
    expect(guessWineType("A crisp white Burgundy")).toBe("white");
    expect(guessWineType("Vintage Port")).toBe("fortified");
    expect(guessWineType("Provence Rosé")).toBe("rose");
  });

  it("accepts known types directly", () => {
    expect(asWineType("red")).toBe("red");
    expect(asWineType("Sparkling")).toBe("sparkling");
  });
});

describe("finaliseScrapedWine", () => {
  it("throws without a name", () => {
    expect(() => finaliseScrapedWine({})).toThrow(/name/i);
  });

  it("fills defaults and de-duplicates grapes", () => {
    const result = finaliseScrapedWine({
      name: "Test Red 2016",
      grapes: ["Merlot", "Merlot", "Cabernet Sauvignon"],
    });
    expect(result.name).toBe("Test Red 2016");
    expect(result.type).toBe("red");
    expect(result.vintageYear).toBe(2016);
    expect(result.grapes).toEqual(["Merlot", "Cabernet Sauvignon"]);
    expect(result.country).toBeNull();
  });
});
