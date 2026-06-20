import { asWineType, parseVintageYear, parseVolumeMl } from "../normalize";
import type { ScrapedWine, SiteAdapter } from "../types";
import { extractCommon, extractSpecValue, loadHtml } from "./common";

/**
 * Adapter for thewinesociety.com. The Wine Society renders product details
 * server-side, exposing a schema.org Product block plus a "wine facts" spec
 * list, so a static fetch is sufficient.
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

    const country = extractSpecValue($, ["Country"]);
    const region = extractSpecValue($, ["Region", "Appellation"]);
    const grapeRaw = extractSpecValue($, ["Grape", "Grapes", "Grape variety"]);
    const style = extractSpecValue($, ["Style", "Colour", "Wine type"]);
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
