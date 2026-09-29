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
  override readonly strategies: Strategy[] = ["api", "http"];
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
    // A vintage_id in the link can name another wine's vintage, so only use
    // a vintage of the wine the page is for. Without a match the page is
    // fetched and its own vintage id is used.
    const wineId = /\/w\/(\d+)/.exec(ctx.url.pathname)?.[1];
    const vintage = ctx.api
      .map(({ data }) => (isRecord(data) ? data.vintage : undefined))
      .filter(isRecord)
      .find(
        (v) => !wineId || (isRecord(v.wine) && String(v.wine.id) === wineId),
      );
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

/** The vintage the page shows, else the one the link names. */
function vintageId(ctx: ImportContext): string | undefined {
  for (const key of APP_LINK_META) {
    const match = /[?&]vintage_id=(\d+)/.exec(ctx.meta.get(key) ?? "");
    if (match) return match[1];
  }
  const fromUrl = ctx.url.searchParams.get("vintage_id");
  return fromUrl && /^\d+$/.test(fromUrl) ? fromUrl : undefined;
}

function grapeNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((grape) => (isRecord(grape) ? grape.name : undefined))
    .filter((name): name is string => typeof name === "string");
}
