import type { Page } from "playwright";
import type { ScrapeResult, WineType } from "../types";

function parsePrice(text: string): number | null {
  const match = text.replace(/,/g, "").match(/[\d]+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

function parseYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0], 10) : null;
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

  // Product heading
  const heading = await page.$eval("h1", (el) => el.textContent?.trim() ?? "").catch(() => "");
  if (heading) {
    if (!wineName) wineName = heading;
    if (!year) year = parseYear(heading);
    if (!wineType) wineType = inferWineType(heading);
  }

  // The Wine Society uses a structured product detail table
  const tableData = await page.evaluate(() => {
    const rows = document.querySelectorAll(".product-detail-table tr, .product-details tr, table tr");
    const result: Record<string, string> = {};
    for (const row of rows) {
      const cells = row.querySelectorAll("td, th");
      if (cells.length >= 2) {
        const key = cells[0].textContent?.trim().toLowerCase() ?? "";
        const value = cells[1].textContent?.trim() ?? "";
        result[key] = value;
      }
    }
    return result;
  });

  if (tableData["producer"] || tableData["winery"] || tableData["domaine"]) {
    winemakerName = tableData["producer"] ?? tableData["winery"] ?? tableData["domaine"] ?? null;
  }
  if (tableData["region"]) regionName = tableData["region"];
  if (tableData["country"]) countryName = tableData["country"];
  if (tableData["grape variety"] || tableData["grape varieties"] || tableData["grapes"]) {
    const raw = tableData["grape variety"] ?? tableData["grape varieties"] ?? tableData["grapes"] ?? "";
    grapeNames = raw.split(/[,&]/).map((g) => g.trim()).filter(Boolean);
  }
  if (tableData["style"] || tableData["type"] || tableData["colour"]) {
    const styleText = tableData["style"] ?? tableData["type"] ?? tableData["colour"] ?? "";
    if (!wineType) wineType = inferWineType(styleText);
  }

  // Fallback: scan body text for common labels
  if (!regionName || !countryName || grapeNames.length === 0) {
    const bodyData = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        region: text.match(/Region[:\s]+([^\n]+)/i)?.[1]?.trim() ?? null,
        country: text.match(/Country[:\s]+([^\n]+)/i)?.[1]?.trim() ?? null,
        grapes: text.match(/Grape(?:s)?[:\s]+([^\n]+)/i)?.[1]?.trim() ?? null,
      };
    });
    if (!regionName && bodyData.region) regionName = bodyData.region;
    if (!countryName && bodyData.country) countryName = bodyData.country;
    if (grapeNames.length === 0 && bodyData.grapes) {
      grapeNames = bodyData.grapes.split(/[,&]/).map((g) => g.trim()).filter(Boolean);
    }
  }

  // Price
  if (!pricePerBottle) {
    const priceText = await page.evaluate(() => {
      const el = document.querySelector(".price, .product-price, [itemprop='price'], .buying-price");
      return el?.textContent?.trim() ?? null;
    });
    if (priceText) pricePerBottle = parsePrice(priceText);
  }

  // Strip year from wine name if present
  if (wineName && year) {
    wineName = wineName.replace(year.toString(), "").trim().replace(/\s+/g, " ");
  }

  return { wineName, year, wineType, winemakerName, countryName, regionName, grapeNames, pricePerBottle };
}
