import { nakedWines } from "./adapters/naked-wines";
import { theWineSociety } from "./adapters/the-wine-society";
import type { SiteAdapter } from "./types";

export { SUPPORTED_SITE_LABELS } from "../sites";

/**
 * Registered site adapters, in priority order. To support a new retailer, add
 * an adapter file and append it here — nothing else in the pipeline changes.
 */
export const adapters: SiteAdapter[] = [theWineSociety, nakedWines];

/** Find the adapter that handles a URL, or null if the site is unsupported. */
export function pickAdapter(url: URL): SiteAdapter | null {
  return adapters.find((adapter) => adapter.matches(url)) ?? null;
}

/** Labels of supported sites, for display / error messages. */
export function supportedSiteLabels(): string[] {
  return adapters.map((a) => a.label);
}
