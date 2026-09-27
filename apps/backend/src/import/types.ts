import type { CheerioAPI } from "cheerio";
import type { BottleSize, WineType } from "@cellarboss/validators";

/** Where a value came from. Used for precedence and shown as a hint in the UI. */
export type FieldSource =
  | "api"
  | "site"
  | "json-ld"
  | "microdata"
  | "label-table"
  | "open-graph"
  | "heuristic";

/** A value plus where it came from and how sure the extractor is (0–1). */
export interface Extracted<T> {
  value: T;
  source: FieldSource;
  confidence: number;
}

/**
 * Raw fields as found on the page, before normalisation. Extractors and site
 * adapters only ever produce these; `normalise()` turns them into an
 * `ImportedWine`.
 */
export const RAW_FIELDS = [
  "title",
  "name",
  "winemaker",
  "country",
  "region",
  "grapes",
  "type",
  "vintage",
  "drinkingWindow",
  "drinkFrom",
  "drinkUntil",
  "size",
  "price",
  "currency",
  "image",
] as const;

export type RawField = (typeof RAW_FIELDS)[number];
export type RawValue = string | string[];
export type RawWine = Partial<Record<RawField, Extracted<RawValue>>>;

export interface Diagnostic {
  level: "info" | "warn";
  code: string;
  message: string;
}

/** The normalised result of an import. Diagnostics are server-side only. */
export interface ImportedWine {
  sourceUrl: string;
  importerId: string;
  /** The page's own title, kept so the UI can show it as a hint. */
  title?: Extracted<string>;
  /** Wine name with producer, vintage and size removed. */
  name?: Extracted<string>;
  type?: Extracted<WineType>;
  winemaker?: Extracted<string>;
  country?: Extracted<string>;
  /** Most specific first, e.g. ["Haut-Médoc", "Bordeaux"]. */
  regions?: Extracted<string[]>;
  grapes?: Extracted<string[]>;
  vintage?: {
    year?: Extracted<number | null>;
    drinkFrom?: Extracted<number>;
    drinkUntil?: Extracted<number>;
  };
  /** Extracted for a future bottle import; not used by the wine/vintage import. */
  bottle?: {
    size?: Extracted<BottleSize>;
    price?: Extracted<{ amount: number; currency: string | null }>;
  };
  imageUrl?: Extracted<string>;
  diagnostics: Diagnostic[];
}

/** How a page's data is obtained. The backend tries an adapter's strategies in order. */
export type Strategy = "api" | "http" | "supplied";

export interface FetchedDocument {
  url: URL;
  contentType: "html" | "json";
  body: string;
  via: Strategy;
}

export interface FetchRequest {
  url: URL;
  accept: "html" | "json";
}

/** Implemented by the backend's safe fetcher. The import module itself does no I/O. */
export interface Fetcher {
  fetch(request: FetchRequest): Promise<FetchedDocument>;
}

/** Everything an extractor may read. Built once per page by `buildContext()`. */
export interface ImportContext {
  url: URL;
  $: CheerioAPI;
  /** Every parsed JSON-LD block on the page. */
  jsonLd: unknown[];
  /** `<meta>` tags keyed by lower-cased `property` or `name`. */
  meta: Map<string, string>;
  /** Parsed `__NEXT_DATA__` and `application/json` script blocks, for site adapters. */
  embeddedJson: unknown[];
  /** Parsed responses from the adapter's `apiRequests()`, if any were fetched. */
  api: { url: URL; data: unknown }[];
  /** Year used for "Now" in drinking windows and for vintage sanity checks. */
  currentYear: number;
}

export type Extractor = (ctx: ImportContext) => RawWine;
