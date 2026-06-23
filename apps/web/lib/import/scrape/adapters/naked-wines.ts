import { asWineType, parseVintageYear, parseVolumeMl } from "../normalize";
import type { ScrapedWine, SiteAdapter } from "../types";
import {
  extractCommon,
  extractInlineObject,
  extractSpecValue,
  loadHtml,
} from "./common";

/**
 * The fields we read off Naked Wines' inline `const product = {...}` blob.
 * Everything is `unknown` because it comes straight from page JSON; the helpers
 * below coerce defensively.
 */
interface NakedProduct {
  productName?: unknown;
  vintage?: unknown;
  wineGrape?: unknown;
  grape?: unknown;
  origin?: unknown;
  region?: unknown;
  productStyleDesc?: unknown;
  productFamily?: unknown;
  bottleSize?: unknown;
  size?: unknown;
  listPrice?: unknown;
  salePrice?: unknown;
  producer?: unknown;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Coerce a JSON value to a non-empty string (numbers become their decimal). */
function str(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() ? value : undefined;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

/** Build a producer display name from a `producer` node. */
function producerName(producer: Record<string, unknown>): string | undefined {
  const name = str(producer.name);
  if (name) return name;
  const parts = [str(producer.firstName), str(producer.lastName)].filter(
    Boolean,
  );
  return parts.length ? parts.join(" ") : undefined;
}

/**
 * Adapter for nakedwines.com / .co.uk. The product page is client-rendered and
 * exposes no schema.org Product or spec table — all the structured data lives
 * in an inline `const product = {...}` blob, so that is the primary source.
 * OpenGraph tags and (legacy) spec markup are kept as fallbacks.
 */
export const nakedWines: SiteAdapter = {
  id: "naked-wines",
  label: "Naked Wines",

  matches(url) {
    return /(^|\.)nakedwines\.(com|co\.uk)$/i.test(url.hostname);
  },

  extract(html) {
    const $ = loadHtml(html);
    const common = extractCommon($);

    const product =
      (extractInlineObject(
        html,
        /const\s+product\s*=/,
      ) as NakedProduct | null) ?? {};
    const producer = isObject(product.producer) ? product.producer : {};
    const family = isObject(product.productFamily) ? product.productFamily : {};

    const name = str(product.productName) ?? common.name;

    const country =
      str(product.origin) ??
      extractSpecValue($, ["Country", "Country of origin"]) ??
      undefined;
    const region =
      str(product.region) ??
      extractSpecValue($, ["Region", "Appellation"]) ??
      undefined;
    const winemaker =
      producerName(producer) ??
      common.winemaker ??
      extractSpecValue($, ["Winemaker", "Producer"]) ??
      undefined;

    // Type from the wine's style/category label, falling back to the name.
    const styleText =
      str(product.productStyleDesc) ??
      str(family.category) ??
      extractSpecValue($, ["Style", "Type", "Colour", "Color"]) ??
      undefined;

    // Grapes: prefer a structured array, then the single `wineGrape` string,
    // then any spec-list value, splitting blends on common separators.
    const grapeArray = Array.isArray(product.grape)
      ? (product.grape as unknown[])
          .map(str)
          .filter((g): g is string => Boolean(g))
      : [];
    const grapeRaw =
      str(product.wineGrape) ??
      extractSpecValue($, ["Grape", "Grapes", "Variety", "Varietal"]);
    const grapes =
      grapeArray.length > 0
        ? grapeArray
        : grapeRaw
          ? grapeRaw
              .split(/[,/&]| and /i)
              .map((g) => g.trim())
              .filter(Boolean)
          : [];

    // `bottleSize` / `size` are already in millilitres on this site.
    const volumeMl =
      num(product.bottleSize) ??
      num(product.size) ??
      parseVolumeMl(extractSpecValue($, ["Size", "Bottle size", "Volume"])) ??
      undefined;

    const result: Partial<ScrapedWine> = {
      ...common,
      name,
      winemaker,
      country,
      region,
      grapes,
      type: asWineType(styleText) ?? asWineType(name) ?? undefined,
      vintageYear:
        parseVintageYear(str(product.vintage)) ??
        parseVintageYear(name) ??
        undefined,
      volumeMl,
      price:
        num(product.listPrice) ??
        num(product.salePrice) ??
        common.price ??
        undefined,
    };
    return result;
  },
};
