import type {
  Diagnostic,
  Extracted,
  ImportedWine,
  RawValue,
  RawWine,
} from "../types.js";
import { parseBottleSize, parsePrice } from "./bottle.js";
import { parseDrinkingWindow } from "./drinking-window.js";
import { splitGrapes } from "./grapes.js";
import { cleanText, splitList } from "./text.js";
import { findYear, parseVintage } from "./vintage.js";
import { deriveWineName } from "./wine-name.js";
import { toWineType } from "./wine-type.js";

export type NormalisedWine = Omit<ImportedWine, "sourceUrl" | "importerId">;

function text(value: RawValue): string {
  return cleanText(Array.isArray(value) ? value.join(", ") : value);
}

/** Keeps a field's source and confidence while converting its value. */
function map<T>(
  field: Extracted<RawValue> | undefined,
  convert: (value: RawValue) => T | undefined,
): Extracted<T> | undefined {
  if (!field) return undefined;
  const value = convert(field.value);
  if (value === undefined) return undefined;
  if (Array.isArray(value) && value.length === 0) return undefined;
  if (typeof value === "string" && value === "") return undefined;
  return { value, source: field.source, confidence: field.confidence };
}

/** Turns merged raw fields into typed, cleaned values. */
export function normalise(
  raw: RawWine,
  { currentYear, baseUrl }: { currentYear: number; baseUrl: URL },
): NormalisedWine {
  const diagnostics: Diagnostic[] = [];
  const result: NormalisedWine = { diagnostics };

  result.title = map(raw.title, text);
  result.winemaker = map(raw.winemaker, text);
  result.country = map(raw.country, text);
  result.regions = map(raw.region, splitList);
  result.grapes = map(raw.grapes, splitGrapes);

  // Type: an explicit colour first, then any hint in the title.
  result.type = map(raw.type, (v) => toWineType(text(v)));
  if (!result.type && result.title) {
    const type = toWineType(result.title.value);
    if (type)
      result.type = { value: type, source: "heuristic", confidence: 0.3 };
  }

  // Vintage: an explicit field first, then a year in the title.
  let year = map(raw.vintage, (v) => parseVintage(text(v), currentYear));
  if (!year && result.title) {
    const found = parseVintage(result.title.value, currentYear);
    if (found !== undefined)
      year = { value: found, source: "heuristic", confidence: 0.5 };
  }

  const window = raw.drinkingWindow
    ? parseDrinkingWindow(text(raw.drinkingWindow.value), currentYear)
    : {};
  const drinkFrom =
    map(raw.drinkFrom, (v) => findYear(text(v), currentYear + 100)) ??
    withSource(window.from, raw.drinkingWindow);
  const drinkUntil =
    map(raw.drinkUntil, (v) => findYear(text(v), currentYear + 100)) ??
    withSource(window.until, raw.drinkingWindow);
  if (year || drinkFrom || drinkUntil) {
    result.vintage = { year, drinkFrom, drinkUntil };
  }

  // Name: an explicit name wins; otherwise derive it from the title.
  const nameSource = raw.name ?? raw.title;
  result.name = map(nameSource, (v) =>
    deriveWineName(text(v), {
      winemaker: result.winemaker?.value,
      year: year?.value,
    }),
  );
  if (!result.name) {
    diagnostics.push({
      level: "warn",
      code: "missing_name",
      message: "No wine name found",
    });
  }

  const size = map(raw.size, (v) => parseBottleSize(text(v)));
  const price = map(raw.price, (v) =>
    parsePrice(text(v), raw.currency ? text(raw.currency.value) : undefined),
  );
  if (size || price) result.bottle = { size, price };

  result.imageUrl = map(raw.image, (v) => {
    try {
      const url = new URL(text(v), baseUrl);
      return url.protocol === "https:" || url.protocol === "http:"
        ? url.href
        : undefined;
    } catch {
      return undefined;
    }
  });

  return result;
}

function withSource<T>(
  value: T | undefined,
  field: Extracted<RawValue> | undefined,
): Extracted<T> | undefined {
  if (value === undefined || !field) return undefined;
  return { value, source: field.source, confidence: field.confidence };
}
