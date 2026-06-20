import { asWineType, parseVintageYear, parseVolumeMl } from "../normalize";
import type { ScrapedWine, SiteAdapter } from "../types";
import { extractCommon, extractSpecValue, loadHtml } from "./common";

/**
 * Adapter for nakedwines.com / .co.uk. Naked Wines exposes a schema.org
 * Product block and a product-attributes list; the producer ("winemaker") is
 * a first-class concept on the site and usually present in the brand field.
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

    const country = extractSpecValue($, ["Country", "Country of origin"]);
    const region = extractSpecValue($, ["Region", "Appellation"]);
    const grapeRaw = extractSpecValue($, [
      "Grape",
      "Grapes",
      "Variety",
      "Varietal",
    ]);
    const style = extractSpecValue($, ["Style", "Type", "Colour", "Color"]);
    const volumeRaw = extractSpecValue($, ["Size", "Bottle size", "Volume"]);
    const winemakerSpec = extractSpecValue($, ["Winemaker", "Producer"]);

    const grapes = grapeRaw
      ? grapeRaw
          .split(/[,/&]| and /i)
          .map((g) => g.trim())
          .filter(Boolean)
      : [];

    const result: Partial<ScrapedWine> = {
      ...common,
      winemaker: common.winemaker ?? winemakerSpec ?? undefined,
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
