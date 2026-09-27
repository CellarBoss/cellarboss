/**
 * Records a real product page as an import fixture. Development only.
 *
 *   pnpm --filter @cellarboss/backend import:recon <url> [--name <slug>]
 *   pnpm --filter @cellarboss/backend import:recon <url> --html <saved-page.html>
 *
 * Without --html it loads the page once in Chromium (Playwright), keeping the
 * HTML as served plus any JSON the page fetched from its own site. With
 * --html it uses a page saved from your own browser instead, for sites that
 * need a login or block automated browsers.
 *
 * Browsers come from Playwright's cache (`pnpm --filter web exec playwright
 * install chromium`); set PLAYWRIGHT_CHROMIUM_PATH to use another Chromium.
 *
 * It writes src/import/__tests__/fixtures/<importer>/<slug>/ and a draft
 * expected.json to review before committing.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { parseArgs } from "util";
import { load } from "cheerio";
import { buildContext, ImporterRegistry } from "../src/import/index.js";
import {
  summarise,
  type FixtureExpectation,
} from "../src/import/__tests__/fixture-summary.js";

const FIXTURES = path.join(
  import.meta.dirname,
  "../src/import/__tests__/fixtures",
);
const USER_AGENT = "CellarBoss/dev (+https://cellarboss.org) import-recon";

interface Recording {
  html: string;
  api: { url: string; body: string }[];
}

async function record(url: URL): Promise<Recording> {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });
  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    const api: Recording["api"] = [];
    const pending: Promise<void>[] = [];

    page.on("response", (response) => {
      const responseUrl = new URL(response.url());
      const type = response.headers()["content-type"] ?? "";
      if (!type.includes("json") || !sameSite(responseUrl, url)) return;
      pending.push(
        response
          .text()
          .then((body) => void api.push({ url: responseUrl.href, body }))
          .catch(() => undefined),
      );
    });

    const main = await page.goto(url.href, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });
    if (!main?.ok())
      throw new Error(`Page returned HTTP ${main?.status() ?? "no response"}`);
    const html = await main.text();
    await Promise.all(pending);
    return { html, api };
  } finally {
    await browser.close();
  }
}

/** Same registrable domain, near enough: "www.example.com" and "api.example.com". */
function sameSite(a: URL, b: URL): boolean {
  const base = (host: string) => host.split(".").slice(-2).join(".");
  return base(a.hostname) === base(b.hostname);
}

/** Keeps what the extractors read and drops the rest of the retailer's page. */
function trim(html: string, url: URL): string {
  const $ = load(html);
  $("script")
    .not(
      '[type="application/ld+json"], [type="application/json"], #__NEXT_DATA__',
    )
    .remove();
  $("style, noscript, iframe, svg, link, template").remove();
  $.root()
    .find("*")
    .addBack()
    .contents()
    .filter((_, node) => node.type === "comment")
    .remove();
  $("[srcset]").removeAttr("srcset");
  $("[style]").removeAttr("style");
  const header = `<!-- Recorded from ${url.href} on ${new Date().toISOString().slice(0, 10)} for CellarBoss import tests. Trimmed; not the full page. -->\n`;
  return header + $.html();
}

function slugFor(url: URL): string {
  const last = url.pathname.split("/").filter(Boolean).pop() ?? url.hostname;
  return last
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { name: { type: "string" }, html: { type: "string" } },
  });
  if (positionals.length !== 1) {
    console.error("Usage: import:recon <url> [--name <slug>] [--html <file>]");
    process.exit(1);
  }

  const url = new URL(positionals[0]);
  const recording: Recording = values.html
    ? { html: readFileSync(values.html, "utf8"), api: [] }
    : await record(url);

  const html = trim(recording.html, url);
  const currentYear = new Date().getFullYear();
  const ctx = buildContext({ url, html, api: recording.api, currentYear });
  const importer = new ImporterRegistry().forUrl(url);
  const wine = importer.extract(ctx);

  const dir = path.join(FIXTURES, importer.id, values.name ?? slugFor(url));
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "page.html"), html);

  if (recording.api.length) {
    mkdirSync(path.join(dir, "api"), { recursive: true });
    recording.api.forEach((response, i) =>
      writeFileSync(
        path.join(dir, "api", `${String(i + 1).padStart(2, "0")}.json`),
        JSON.stringify(response, null, 2) + "\n",
      ),
    );
  }

  const expectedPath = path.join(dir, "expected.json");
  if (!existsSync(expectedPath)) {
    const expected: FixtureExpectation = {
      url: url.href,
      importer: importer.id,
      recordedAt: new Date().toISOString(),
      currentYear,
      reviewed: false,
      fields: summarise(wine),
    };
    writeFileSync(expectedPath, JSON.stringify(expected, null, 2) + "\n");
  }

  console.log(
    `Saved ${path.relative(process.cwd(), dir)} (importer: ${importer.id})`,
  );
  console.log(
    `JSON-LD blocks: ${ctx.jsonLd.length}, embedded JSON: ${ctx.embeddedJson.length}, API responses: ${recording.api.length}`,
  );
  console.log("Extracted:", JSON.stringify(summarise(wine), null, 2));
  for (const d of wine.diagnostics) console.log(`${d.level}: ${d.message}`);
  if (
    !existsSync(expectedPath) ||
    !JSON.parse(readFileSync(expectedPath, "utf8")).reviewed
  ) {
    console.log(
      'Review expected.json against the page, then set "reviewed": true.',
    );
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
