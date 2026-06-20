import { WINE_TYPES, type WineType } from "@cellarboss/validators/constants";
import type { ScrapedWine } from "./types";

/**
 * Collapse whitespace, normalise Unicode and trim. Cheerio's `.text()` already
 * decodes HTML entities, so this focuses on the leftovers (NBSPs, accents
 * stored as decomposed code points, runs of whitespace) that broke the
 * previous implementation's naive string handling.
 */
export function cleanText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const normalised = value
    .normalize("NFC")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return normalised.length > 0 ? normalised : null;
}

/** Lower-cased, accent-stripped, punctuation-collapsed form for comparisons. */
export function comparableName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Pull a plausible vintage year (1900–next year) from arbitrary text. */
export function parseVintageYear(
  value: string | null | undefined,
): number | null {
  if (!value) return null;
  // "NV" / "non vintage" wines deliberately have no year.
  if (/\bnon[-\s]?vintage\b|\bnv\b/i.test(value)) return null;
  const nextYear = new Date().getFullYear() + 1;
  const matches = value.match(/\b(19\d{2}|20\d{2})\b/g);
  if (!matches) return null;
  for (const m of matches) {
    const year = Number(m);
    if (year >= 1900 && year <= nextYear) return year;
  }
  return null;
}

/** Parse a volume into millilitres, handling cl / ml / l / L. */
export function parseVolumeMl(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value
    .replace(",", ".")
    .match(/(\d+(?:\.\d+)?)\s*(ml|cl|l|litre|liter)\b/i);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return null;
  switch (match[2].toLowerCase()) {
    case "ml":
      return Math.round(amount);
    case "cl":
      return Math.round(amount * 10);
    default:
      return Math.round(amount * 1000);
  }
}

/** Parse a price, stripping currency symbols and thousands separators. */
export function parsePrice(value: string | null | undefined): number | null {
  if (value == null) return null;
  const str = String(value).replace(/[^0-9.,]/g, "");
  if (!str) return null;
  // Drop thousands separators, then treat a remaining comma as the decimal.
  const normalised = str.replace(/,(?=\d{3}\b)/g, "").replace(",", ".");
  const num = Number(normalised);
  return Number.isFinite(num) ? num : null;
}

const TYPE_KEYWORDS: Array<[WineType, RegExp]> = [
  ["sparkling", /\b(sparkling|champagne|prosecco|cava|cremant|spumante)\b/i],
  ["fortified", /\b(fortified|port|sherry|madeira|marsala)\b/i],
  ["dessert", /\b(dessert|sweet|sauternes|ice ?wine|tokaji|noble rot)\b/i],
  ["rose", /\bros[eé](?![a-z])/i],
  ["orange", /\b(orange|skin[-\s]?contact|amber)\s+wine\b/i],
  ["white", /\b(white)\b/i],
  ["red", /\b(red)\b/i],
];

/** Best-effort guess of wine type from free text (e.g. a category label). */
export function guessWineType(
  value: string | null | undefined,
): WineType | null {
  if (!value) return null;
  for (const [type, pattern] of TYPE_KEYWORDS) {
    if (pattern.test(value)) return type;
  }
  return null;
}

/** Coerce an arbitrary string to a known WineType, or null. */
export function asWineType(value: string | null | undefined): WineType | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  return (WINE_TYPES as readonly string[]).includes(lower)
    ? (lower as WineType)
    : guessWineType(value);
}

/**
 * Turn a partial extraction into a complete, cleaned ScrapedWine. Throws if no
 * name could be found, since the rest of the pipeline cannot proceed without
 * one.
 */
export function finaliseScrapedWine(
  partial: Partial<ScrapedWine>,
): ScrapedWine {
  const name = cleanText(partial.name);
  if (!name) {
    throw new Error("Could not find a wine name on the page");
  }

  const grapes = (partial.grapes ?? [])
    .map((g) => cleanText(g))
    .filter((g): g is string => g != null);

  return {
    name,
    type: partial.type ?? guessWineType(name),
    vintageYear: partial.vintageYear ?? parseVintageYear(name),
    winemaker: cleanText(partial.winemaker),
    region: cleanText(partial.region),
    country: cleanText(partial.country),
    grapes: Array.from(new Set(grapes)),
    volumeMl: partial.volumeMl ?? null,
    price: partial.price ?? null,
    imageUrl: cleanText(partial.imageUrl),
    description: cleanText(partial.description),
  };
}
