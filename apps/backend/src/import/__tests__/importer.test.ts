import { readFileSync } from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import {
  buildContext,
  defineLabelTableImporter,
  GenericImporter,
  ImporterRegistry,
} from "../index.js";
import { mergeByPrecedence } from "../merge.js";

const sample = (name: string) =>
  readFileSync(path.join(import.meta.dirname, "samples", name), "utf8");

const importSample = (name: string, url = "https://shop.example.com/wine/1") =>
  new GenericImporter().extract(
    buildContext({ url, html: sample(name), currentYear: 2026 }),
  );

describe("GenericImporter", () => {
  it("reads JSON-LD products, decoding entities", () => {
    const wine = importSample("json-ld-product.html");

    expect(wine.importerId).toBe("generic");
    expect(wine.title?.value).toBe("Château Example, Margaux 2015");
    expect(wine.winemaker?.value).toBe("Château Example");
    expect(wine.name?.value).toBe("Margaux");
    expect(wine.country?.value).toBe("France");
    expect(wine.regions?.value).toEqual(["Margaux", "Bordeaux"]);
    expect(wine.grapes?.value).toEqual(["Cabernet Sauvignon", "Merlot"]);
    expect(wine.type?.value).toBe("red");
    expect(wine.vintage?.year?.value).toBe(2015);
    expect(wine.bottle?.size?.value).toBe("standard");
    expect(wine.bottle?.price?.value).toEqual({ amount: 45, currency: "GBP" });
    expect(wine.imageUrl?.value).toBe(
      "https://shop.example.com/images/bottle.jpg",
    );
  });

  it("reads labelled facts tables", () => {
    const wine = importSample("label-table.html");

    expect(wine.winemaker).toMatchObject({
      value: "Domaine Exemple",
      source: "label-table",
    });
    expect(wine.name?.value).toBe("Côtes-du-Rhône Rosé");
    expect(wine.country?.value).toBe("France");
    expect(wine.regions?.value).toEqual(["Côtes-du-Rhône", "Rhône"]);
    expect(wine.grapes?.value).toEqual(["Grenache", "Cinsault", "Syrah"]);
    expect(wine.type?.value).toBe("rose");
    expect(wine.vintage?.year?.value).toBe(2023);
    expect(wine.vintage?.drinkFrom?.value).toBe(2026);
    expect(wine.vintage?.drinkUntil?.value).toBe(2026);
    expect(wine.bottle?.size?.value).toBe("standard");
  });

  it("reads microdata, ignoring the brand's nested name", () => {
    const wine = importSample("microdata.html");

    expect(wine.title?.value).toBe("Example Estate Pinot Noir 2021");
    expect(wine.winemaker?.value).toBe("Example Estate");
    expect(wine.name?.value).toBe("Pinot Noir");
    expect(wine.bottle?.price?.value).toEqual({
      amount: 24.5,
      currency: "EUR",
    });
    expect(wine.imageUrl?.value).toBe("https://shop.example.com/pinot.jpg");
  });

  it("falls back to OpenGraph and guesses type and vintage from the title", () => {
    const wine = importSample("open-graph-only.html");

    expect(wine.name?.value).toBe("Sparkling Brut");
    expect(wine.type).toMatchObject({
      value: "sparkling",
      source: "heuristic",
    });
    expect(wine.vintage?.year?.value).toBeNull();
    expect(wine.winemaker).toBeUndefined();
  });

  it("drops the site name from OpenGraph titles", () => {
    const wine = new GenericImporter().extract(
      buildContext({
        url: "https://example.com",
        html: '<meta property="og:title" content="Rioja Reserva 2019 | Example Wines">',
      }),
    );
    expect(wine.name?.value).toBe("Rioja Reserva");
  });

  it("reports a missing name without throwing", () => {
    const wine = new GenericImporter().extract(
      buildContext({ url: "https://example.com", html: "<p>Nothing here</p>" }),
    );
    expect(wine.name).toBeUndefined();
    expect(wine.diagnostics.map((d) => d.code)).toContain("missing_required");
  });
});

describe("mergeByPrecedence", () => {
  it("takes the most confident value, and the later layer on a tie", () => {
    const merged = mergeByPrecedence([
      { title: { value: "A", source: "open-graph", confidence: 0.4 } },
      { title: { value: "B", source: "json-ld", confidence: 0.8 } },
      { title: { value: "C", source: "label-table", confidence: 0.6 } },
      { title: { value: "D", source: "site", confidence: 0.8 } },
      { title: { value: " ", source: "api", confidence: 1 } },
    ]);
    expect(merged.title?.value).toBe("D");
  });
});

describe("defineLabelTableImporter", () => {
  const importer = defineLabelTableImporter({
    id: "exemple",
    label: "Exemple Wines",
    hosts: ["exemple.example"],
    container: ".product-details",
    labels: {
      Producer: "winemaker",
      Region: "region",
      Grapes: "grapes",
      Drink: "drinkingWindow",
    },
  });

  it("handles its hosts and subdomains only", () => {
    expect(importer.canHandle(new URL("https://exemple.example/w/1"))).toBe(
      true,
    );
    expect(importer.canHandle(new URL("https://www.exemple.example/w/1"))).toBe(
      true,
    );
    expect(importer.canHandle(new URL("https://notexemple.example/w/1"))).toBe(
      false,
    );
  });

  it("reads the configured labels at site precedence", () => {
    const wine = importer.extract(
      buildContext({
        url: "https://exemple.example/w/1",
        html: sample("label-table.html"),
        currentYear: 2026,
      }),
    );
    expect(wine.importerId).toBe("exemple");
    expect(wine.winemaker).toMatchObject({
      value: "Domaine Exemple",
      source: "site",
    });
    expect(wine.grapes?.value).toEqual(["Grenache", "Cinsault", "Syrah"]);
    expect(wine.diagnostics).toEqual([]);
  });

  it("is chosen by the registry, with the generic importer as fallback", () => {
    const registry = new ImporterRegistry([importer]);
    expect(registry.forUrl(new URL("https://exemple.example/x")).id).toBe(
      "exemple",
    );
    expect(registry.forUrl(new URL("https://other.example/x")).id).toBe(
      "generic",
    );
    expect(registry.sites()).toEqual([
      { id: "exemple", label: "Exemple Wines", hosts: ["exemple.example"] },
    ]);
  });
});
