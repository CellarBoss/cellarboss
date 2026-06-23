import { asWineType, parseVintageYear, parseVolumeMl } from "../normalize";
import type { ScrapedWine, SiteAdapter } from "../types";
import {
  extractCommon,
  extractIconSpec,
  extractSpecValue,
  loadHtml,
  type CheerioAPI,
} from "./common";

/**
 * Read the country/region/style from the flag-marked origin element, which is
 * sometimes a link (`<a href="/buy/wines/spain/rioja/">…Red Wine from Spain -
 * Rioja</a>`) and sometimes a plain `<div class="product-details__origin">`.
 * The country nav menu uses the same flag icon, so we only accept the variant
 * whose text follows the "<style> from <country> - <region>" shape.
 */
function extractOrigin($: CheerioAPI): {
  style?: string;
  country?: string;
  region?: string;
} {
  let text: string | null = null;
  $("svg.icon--country-flag").each((_, el) => {
    if (text) return;
    const container = $(el).parent();
    if (!container.length) return;
    const candidate = container.text().replace(/\s+/g, " ").trim();
    if (/\sfrom\s/i.test(candidate)) text = candidate;
  });
  if (!text) return {};

  const match = (text as string).match(/^(.*?)\s+from\s+(.+)$/i);
  if (!match) return {};
  const style = match[1].trim();
  const rest = match[2].trim();
  // Split country from region on the first " - " (regions may contain dashes).
  const dash = rest.search(/\s[-–]\s/);
  const country = (dash === -1 ? rest : rest.slice(0, dash)).trim();
  const region =
    dash === -1
      ? ""
      : rest
          .slice(dash)
          .replace(/^\s*[-–]\s*/, "")
          .trim();

  return {
    style: style || undefined,
    country: country || undefined,
    region: region || undefined,
  };
}

/**
 * Adapter for thewinesociety.com. The Wine Society renders product details
 * server-side, but the current page labels its spec list with SVG icons rather
 * than text, so the icon-keyed characteristics are the primary source, with the
 * flag-marked "… from <country> - <region>" line supplying origin. The legacy
 * text spec list and OpenGraph tags are kept as fallbacks.
 */
export const theWineSociety: SiteAdapter = {
  id: "the-wine-society",
  label: "The Wine Society",

  matches(url) {
    return /(^|\.)thewinesociety\.com$/i.test(url.hostname);
  },

  extract(html) {
    const $ = loadHtml(html);
    const common = extractCommon($);

    const origin = extractOrigin($);
    const country = origin.country ?? extractSpecValue($, ["Country"]);
    const region =
      origin.region ?? extractSpecValue($, ["Region", "Appellation"]);
    const grapeRaw =
      extractIconSpec($, ["Grape-Type", "Grape"]) ??
      extractSpecValue($, ["Grape", "Grapes", "Grape variety"]);
    const style =
      extractIconSpec($, ["Style"]) ??
      origin.style ??
      extractSpecValue($, ["Style", "Colour", "Wine type"]);
    const volumeRaw = extractSpecValue($, ["Bottle size", "Size", "Volume"]);

    const grapes = grapeRaw
      ? grapeRaw
          .split(/[,/&]| and /i)
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    const result: Partial<ScrapedWine> = {
      ...common,
      country: country ?? undefined,
      region: region ?? undefined,
      grapes,
      type: asWineType(style) ?? asWineType(common.name) ?? undefined,
      vintageYear: parseVintageYear(common.name) ?? undefined,
      volumeMl: parseVolumeMl(volumeRaw) ?? undefined,
    };
    return result;
  },
};
