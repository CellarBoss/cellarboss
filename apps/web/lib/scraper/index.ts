import type { ScrapeResult } from "./types";
import { scrape as scrapeNakedWines } from "./providers/nakedwines";
import { scrape as scrapeWineSociety } from "./providers/winesociety";
import { scrape as scrapeVivino } from "./providers/vivino";
import type { Page } from "playwright";

type ProviderScraper = (page: Page) => Promise<ScrapeResult>;

const PROVIDERS: Record<string, ProviderScraper> = {
  "nakedwines.co.uk": scrapeNakedWines,
  "nakedwines.com": scrapeNakedWines,
  "thewinesociety.com": scrapeWineSociety,
  "vivino.com": scrapeVivino,
};

export function detectProvider(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return PROVIDERS[hostname] ? hostname : null;
  } catch {
    return null;
  }
}

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  const hostname = detectProvider(url);
  if (!hostname) {
    throw new Error(`Unsupported provider: ${new URL(url).hostname}`);
  }

  const providerFn = PROVIDERS[hostname];

  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    return await providerFn(page);
  } finally {
    await browser.close();
  }
}

export type { ScrapeResult };
