import type { Page } from "playwright";
import type { ScrapeResult, WineType } from "../types";

/**
 * Naked Wines use their own descriptive type labels (e.g. "Fruity Red", "Crisp White").
 * Map these to our canonical WineType values.
 */
function mapNakedWinesType(label: string): WineType | null {
  const l = label.toLowerCase();
  if (l.includes("sparkling") || l.includes("champagne") || l.includes("prosecco") || l.includes("cava") || l.includes("crémant")) return "sparkling";
  if (l.includes("rosé") || l.includes("rose")) return "rose";
  if (l.includes("orange")) return "orange";
  if (l.includes("fortified") || l.includes("port") || l.includes("sherry") || l.includes("madeira")) return "fortified";
  if (l.includes("dessert") || l.includes("sweet") || l.includes("sauternes")) return "dessert";
  if (l.includes("white") || l.includes("blanc") || l.includes("bianco")) return "white";
  if (l.includes("red") || l.includes("rouge") || l.includes("rosso") || l.includes("tinto")) return "red";
  return null;
}

export async function scrape(page: Page): Promise<ScrapeResult> {
  // Wait until the product icon section is rendered (country appears last)
  await page.waitForSelector('[itemprop="addressCountry"]', { timeout: 20000 }).catch(() => null);

  const raw = await page.evaluate(() => {
    // ── Wine name & year ─────────────────────────────────────────────────────
    const nameEl = document.querySelector<HTMLElement>('[itemprop="name"]');
    const fullName =
      nameEl?.textContent?.trim() ??
      document.querySelector("h1")?.textContent?.trim() ??
      null;

    const yearMatch = fullName?.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : null;
    const wineName = fullName
      ? fullName.replace(/\s*\b(19|20)\d{2}\b/, "").trim()
      : null;

    // ── Winemaker ─────────────────────────────────────────────────────────────
    // "div.producer > a" contains "By [Name]"
    const winemakerRaw =
      document.querySelector<HTMLElement>("div.producer > a")?.textContent?.trim() ??
      null;
    const winemakerName = winemakerRaw
      ? winemakerRaw.replace(/^By\s+/i, "").trim()
      : null;

    // ── Country & Region — exposed as itemprop attributes ─────────────────────
    const countryName =
      document.querySelector<HTMLElement>('[itemprop="addressCountry"]')?.textContent?.trim() ?? null;
    const regionName =
      document.querySelector<HTMLElement>('[itemprop="addressRegion"]')?.textContent?.trim() ?? null;

    // ── Grape & type — identified by the SVG icon class in the product__icons row
    // Structure: .row.product__icons > .col > .card-nw > svg.icon__xxx, then sibling p.caption
    const getIconSectionText = (iconSubClass: string): string | null => {
      const icon = document.querySelector<SVGElement>(`svg[class*="${iconSubClass}"]`);
      if (!icon) return null;
      const col = icon.closest(".col");
      return col?.querySelector("p.caption")?.textContent?.trim() ?? null;
    };

    const grapeRaw = getIconSectionText("icon__grapes-line");
    const typeRaw = getIconSectionText("icon__drop-solid-half");

    // Naked Wines gives a blend label (e.g. "Grenache Blend") — treat as single grape entry
    const grapeNames = grapeRaw ? [grapeRaw] : [];

    // ── Price — market price is the reliable public reference ────────────────
    const priceText =
      document.querySelector<HTMLElement>("p.market-price")?.textContent?.trim() ?? null;
    const priceMatch = priceText?.replace(/[£€$,]/g, "").match(/[\d]+(?:\.\d+)?/);
    const pricePerBottle = priceMatch ? parseFloat(priceMatch[0]) : null;

    return { wineName, year, typeRaw, winemakerName, countryName, regionName, grapeNames, pricePerBottle };
  });

  return {
    wineName: raw.wineName,
    year: raw.year,
    wineType: raw.typeRaw ? mapNakedWinesType(raw.typeRaw) : null,
    winemakerName: raw.winemakerName,
    countryName: raw.countryName,
    regionName: raw.regionName,
    grapeNames: raw.grapeNames,
    pricePerBottle: raw.pricePerBottle,
  };
}
