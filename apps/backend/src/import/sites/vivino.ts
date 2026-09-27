import { BaseImporter, type RequiredField } from "../base-importer.js";
import { fromApi, isRecord } from "../extractors/index.js";
import type { ImportContext, RawWine, Strategy } from "../types.js";

/** Vivino's wine type ids. */
const WINE_TYPES: Record<number, string> = {
  1: "red",
  2: "white",
  3: "sparkling",
  4: "rose",
  7: "dessert",
  24: "fortified",
};

/** The app link every wine page carries, e.g. "vivino://?vintage_id=173991458". */
const APP_LINK_META = ["al:android:url", "twitter:app:url:iphone"];

/**
 * vivino.com. Wine pages (/w/{wineId}?year=2021) name the vintage only in
 * an app link, and the page's own data is a large script blob, so the
 * importer reads the vintage id from the page and fetches the vintage from
 * Vivino's JSON API. The page's JSON-LD is the fallback.
 */
export class VivinoImporter extends BaseImporter {
  readonly id = "vivino";
  readonly label = "Vivino";
  readonly hosts = ["vivino.com"];
  override readonly strategies: Strategy[] = ["api", "http", "supplied"];
  override readonly required: RequiredField[] = [
    "name",
    "winemaker",
    "type",
    "vintage",
  ];

  override apiRequests(ctx: ImportContext): URL[] {
    const id = vintageId(ctx);
    return id ? [new URL(`/api/vintages/${id}`, ctx.url.origin)] : [];
  }

  protected override extractApi(ctx: ImportContext): RawWine {
    const vintage = ctx.api
      .map(({ data }) => (isRecord(data) ? data.vintage : undefined))
      .find(isRecord);
    if (!vintage) return {};

    const wine = isRecord(vintage.wine) ? vintage.wine : {};
    const winery = isRecord(wine.winery) ? wine.winery : {};
    const region = isRecord(wine.region) ? wine.region : {};
    const country = isRecord(region.country) ? region.country : {};
    const window = isRecord(vintage.recommended_drinking_window)
      ? vintage.recommended_drinking_window
      : {};
    const image = isRecord(vintage.image) ? vintage.image : {};

    return {
      name: fromApi(wine.name),
      winemaker: fromApi(winery.name),
      country: fromApi(country.name),
      region: fromApi(region.name),
      grapes: fromApi(grapeNames(vintage.grapes ?? wine.grapes)),
      type:
        typeof wine.type_id === "number"
          ? fromApi(WINE_TYPES[wine.type_id])
          : undefined,
      vintage:
        wine.non_vintage === true ? fromApi("NV") : fromApi(vintage.year),
      drinkFrom: fromApi(window.start_year),
      drinkUntil: fromApi(window.end_year),
      image:
        typeof image.location === "string"
          ? fromApi(`https:${image.location.replace(/^https?:/, "")}`)
          : undefined,
    };
  }
}

function vintageId(ctx: ImportContext): string | undefined {
  const fromUrl = ctx.url.searchParams.get("vintage_id");
  if (fromUrl && /^\d+$/.test(fromUrl)) return fromUrl;
  for (const key of APP_LINK_META) {
    const match = /[?&]vintage_id=(\d+)/.exec(ctx.meta.get(key) ?? "");
    if (match) return match[1];
  }
  return undefined;
}

function grapeNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((grape) => (isRecord(grape) ? grape.name : undefined))
    .filter((name): name is string => typeof name === "string");
}
