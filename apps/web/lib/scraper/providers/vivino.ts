import type { Page } from "playwright";
import type { ScrapeResult, WineType } from "../types";

function parsePrice(text: string): number | null {
  const match = text.replace(/,/g, "").match(/[\d]+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

function inferWineType(text: string): WineType | null {
  const lower = text.toLowerCase();
  if (lower.includes("sparkling") || lower.includes("champagne") || lower.includes("prosecco") || lower.includes("cava")) return "sparkling";
  if (lower.includes("rosé") || lower.includes("rose")) return "rose";
  if (lower.includes("white") || lower.includes("blanc") || lower.includes("bianco")) return "white";
  if (lower.includes("orange")) return "orange";
  if (lower.includes("fortified") || lower.includes("port") || lower.includes("sherry") || lower.includes("madeira")) return "fortified";
  if (lower.includes("dessert") || lower.includes("sweet") || lower.includes("sauternes")) return "dessert";
  if (lower.includes("red") || lower.includes("rouge") || lower.includes("rosso") || lower.includes("tinto")) return "red";
  return null;
}

export async function scrape(page: Page): Promise<ScrapeResult> {
  // Vivino is a React SPA — wait for content to hydrate
  await page.waitForLoadState("networkidle");

  let wineName: string | null = null;
  let year: number | null = null;
  let wineType: WineType | null = null;
  let winemakerName: string | null = null;
  let countryName: string | null = null;
  let regionName: string | null = null;
  let grapeNames: string[] = [];
  let pricePerBottle: number | null = null;

  // Try JSON-LD first
  const jsonLd = await page.evaluate(() => {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || "");
        if (data["@type"] === "Product" || data["@type"] === "Wine") return data;
        if (Array.isArray(data["@graph"])) {
          const product = data["@graph"].find((n: any) => n["@type"] === "Product" || n["@type"] === "Wine");
          if (product) return product;
        }
      } catch {}
    }
    return null;
  });

  if (jsonLd) {
    wineName = jsonLd.name ?? null;
    if (jsonLd.offers?.price) pricePerBottle = parseFloat(jsonLd.offers.price);
    if (jsonLd.brand?.name) winemakerName = jsonLd.brand.name;
  }

  // Extract year from URL query string (Vivino passes ?year=YYYY)
  const url = page.url();
  const yearMatch = url.match(/[?&]year=(\d{4})/);
  if (yearMatch) year = parseInt(yearMatch[1], 10);

  // Wine name from heading
  const heading = await page.$eval("h1", (el) => el.textContent?.trim() ?? "").catch(() => "");
  if (heading && !wineName) wineName = heading;

  // Vivino-specific selectors (class names are obfuscated but data-testids and aria are more stable)
  const vivinoData = await page.evaluate(() => {
    const getText = (selector: string) =>
      document.querySelector(selector)?.textContent?.trim() ?? null;

    // Wine type is often in a breadcrumb or subtitle
    const typeEl = getText('[data-testid="wine-type"], .wine-type, .winetype');
    // Winery/producer
    const wineryEl = getText('[data-testid="winery-name"], .winery, a[href*="/wineries/"]');
    // Region
    const regionEl = getText('[data-testid="region-link"], a[href*="/regions/"], .region');
    // Country
    const countryEl = getText('[data-testid="country-link"], a[href*="/countries/"], .country');
    // Price
    const priceEl = getText('[data-testid="price"], .purchaseAvailability__price, .wine-price-value');
    // Grapes — Vivino shows them in flavor profile or grape section
    const grapeEls = document.querySelectorAll('[data-testid="grape-item"], a[href*="/grapes/"], .grape-link');
    const grapes = Array.from(grapeEls).map((el) => el.textContent?.trim() ?? "").filter(Boolean);

    return { typeEl, wineryEl, regionEl, countryEl, priceEl, grapes };
  });

  if (!winemakerName && vivinoData.wineryEl) winemakerName = vivinoData.wineryEl;
  if (!regionName && vivinoData.regionEl) regionName = vivinoData.regionEl;
  if (!countryName && vivinoData.countryEl) countryName = vivinoData.countryEl;
  if (grapeNames.length === 0 && vivinoData.grapes.length > 0) grapeNames = vivinoData.grapes;
  if (!wineType && vivinoData.typeEl) wineType = inferWineType(vivinoData.typeEl);
  if (!pricePerBottle && vivinoData.priceEl) pricePerBottle = parsePrice(vivinoData.priceEl);

  // Fallback: scan meta tags for wine type hints
  if (!wineType) {
    const metaDesc = await page.evaluate(() =>
      document.querySelector('meta[name="description"]')?.getAttribute("content") ?? ""
    );
    if (metaDesc) wineType = inferWineType(metaDesc);
  }

  return { wineName, year, wineType, winemakerName, countryName, regionName, grapeNames, pricePerBottle };
}
