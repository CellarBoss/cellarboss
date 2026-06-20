import type { WineType } from "@cellarboss/validators/constants";

/**
 * Normalised wine details extracted from a web page. Every site adapter
 * produces a (partial) value of this shape; the rest of the import pipeline
 * only ever deals with `ScrapedWine`, never raw HTML. This is the contract
 * that keeps the scraping layer swappable.
 */
export interface ScrapedWine {
  /** Wine / product name (the only field adapters are required to find). */
  name: string;
  type: WineType | null;
  vintageYear: number | null;
  winemaker: string | null;
  region: string | null;
  country: string | null;
  grapes: string[];
  volumeMl: number | null;
  price: number | null;
  imageUrl: string | null;
  description: string | null;
}

/**
 * A pluggable extractor for a single retailer. Adding support for a new site
 * means adding one file that implements this interface and registering it —
 * no changes to the pipeline, matching, or UI.
 */
export interface SiteAdapter {
  /** Stable identifier, e.g. "the-wine-society". */
  id: string;
  /** Human-readable label shown in the UI and error messages. */
  label: string;
  /** Whether this adapter knows how to read the given URL. */
  matches(url: URL): boolean;
  /**
   * Optional custom page fetch. Adapters default to the shared static
   * {@link safeFetch}; a future JS-heavy site (e.g. Vivino) can override this
   * with a Playwright-backed fetch without touching the rest of the pipeline.
   */
  fetch?(url: URL): Promise<string>;
  /** Extract whatever wine details can be found in the page HTML. */
  extract(html: string, url: URL): Partial<ScrapedWine>;
}
