/**
 * Display labels for supported import sites. Kept free of any scraping code
 * (cheerio etc.) so it can be imported into client components without pulling
 * server-only dependencies into the browser bundle. Keep in sync with the
 * adapters registered in `scrape/registry.ts`.
 */
export const SUPPORTED_SITE_LABELS = ["The Wine Society", "Naked Wines"];
