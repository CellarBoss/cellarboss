import { safeFetch } from "./fetcher";
import { finaliseScrapedWine } from "./normalize";
import { pickAdapter, supportedSiteLabels } from "./registry";
import type { ScrapedWine } from "./types";

export { ScrapeFetchError } from "./fetcher";
export { supportedSiteLabels } from "./registry";
export type { ScrapedWine, SiteAdapter } from "./types";

export interface ScrapeResult {
  adapterId: string;
  adapterLabel: string;
  sourceUrl: string;
  wine: ScrapedWine;
}

/** Raised when no registered adapter can handle the given URL. */
export class UnsupportedSiteError extends Error {
  constructor() {
    super(
      `That site isn't supported yet. Supported sites: ${supportedSiteLabels().join(", ")}.`,
    );
    this.name = "UnsupportedSiteError";
  }
}

/**
 * Stage 1 of the import pipeline: fetch the page via the (SSRF-guarded) fetcher
 * for the matching adapter, extract raw details, and normalise them into a
 * complete {@link ScrapedWine}. Pure of any database/matching concerns.
 */
export async function scrape(rawUrl: string): Promise<ScrapeResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("That doesn't look like a valid URL");
  }

  const adapter = pickAdapter(url);
  if (!adapter) {
    throw new UnsupportedSiteError();
  }

  const html = adapter.fetch ? await adapter.fetch(url) : await safeFetch(url);
  const partial = adapter.extract(html, url);
  const wine = finaliseScrapedWine(partial);

  return {
    adapterId: adapter.id,
    adapterLabel: adapter.label,
    sourceUrl: url.toString(),
    wine,
  };
}
