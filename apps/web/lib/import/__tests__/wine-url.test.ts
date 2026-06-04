import { describe, expect, it } from "vitest";
import { buildWineImportDraft, extractWineDetailsFromHtml } from "../wine-url";

describe("extractWineDetailsFromHtml", () => {
  it("extracts wine details from JSON-LD product data", () => {
    const html = `
      <html>
        <head>
          <title>Example Cellars Cabernet Sauvignon 2024 | Shop</title>
          <script type="application/ld+json">
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "Example Cellars Reserve Cabernet Sauvignon 2024",
              "description": "A red wine from Napa Valley, United States.",
              "brand": { "name": "Example Cellars" },
              "productionPlace": {
                "name": "Napa Valley",
                "address": {
                  "addressRegion": "Napa Valley",
                  "addressCountry": "United States"
                }
              }
            }
          </script>
        </head>
      </html>
    `;

    const result = extractWineDetailsFromHtml(html, "https://example.com/wine");

    expect(result).toMatchObject({
      name: "Example Cellars Reserve Cabernet Sauvignon",
      type: "red",
      vintageYear: 2024,
      winemakerName: "Example Cellars",
      regionName: "Napa Valley",
      countryName: "United States",
      grapeNames: ["Cabernet Sauvignon"],
    });
  });

  it("falls back to metadata when JSON-LD is absent", () => {
    const html = `
      <html>
        <head>
          <meta property="og:title" content="Chateau Example Rosé 2023 - Wine Shop" />
          <meta property="og:description" content="Rosé wine made with Grenache." />
        </head>
      </html>
    `;

    const result = extractWineDetailsFromHtml(html, "https://example.com/rose");

    expect(result.name).toBe("Chateau Example Rosé");
    expect(result.type).toBe("rose");
    expect(result.vintageYear).toBe(2023);
    expect(result.grapeNames).toEqual(["Grenache"]);
  });
});

describe("buildWineImportDraft", () => {
  it("matches extracted resources against existing CellarBoss data", () => {
    const draft = buildWineImportDraft(
      {
        sourceUrl: "https://example.com/wine",
        sourceTitle: "Example wine",
        name: "Reserve Cabernet Sauvignon",
        type: "red",
        vintageYear: 2024,
        winemakerName: "Example Cellars",
        regionName: "Napa Valley",
        countryName: "United States",
        grapeNames: ["Cabernet Sauvignon", "Merlot"],
      },
      {
        winemakers: [{ id: 1, name: "Example Cellars" }],
        countries: [{ id: 2, name: "United States" }],
        regions: [{ id: 3, name: "Napa Valley", countryId: 2 }],
        grapes: [{ id: 4, name: "Cabernet Sauvignon" }],
      },
    );

    expect(draft.data).toMatchObject({
      name: "Reserve Cabernet Sauvignon",
      type: "red",
      wineMakerId: 1,
      regionId: 3,
      grapeIds: [4],
    });
    expect(draft.unmatched.grapeNames).toEqual(["Merlot"]);
  });
});
