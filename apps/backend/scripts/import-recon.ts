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
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parseArgs } from "util";
import { load } from "cheerio";
import { buildContext, ImporterRegistry } from "../src/import/index.js";
import {
  summarise,
  type FixtureExpectation,
} from "../src/import/__tests__/fixture-summary.js";

const FIXTURES = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
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
      const type = response.headers()["content-type"] ?? "";
      if (!type.includes("json")) return;
      pending.push(
        response
          .text()
          .then((body) => void api.push({ url: response.url(), body }))
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
    // Only the product's own host, after any redirect: another site's JSON
    // (analytics, ads) doesn't belong in a fixture.
    const host = new URL(main.url()).host;
    return { html, api: api.filter((r) => new URL(r.url).host === host) };
  } finally {
    await browser.close();
  }
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

/** A fixture's page and API responses, without the dated header line. */
function recordedInputs(dir: string): string {
  const page = path.join(dir, "page.html");
  const apiDir = path.join(dir, "api");
  const html = existsSync(page)
    ? readFileSync(page, "utf8").replace(/^<!-- Recorded from .*-->\n/, "")
    : "";
  const api = existsSync(apiDir)
    ? readdirSync(apiDir)
        .sort()
        .map((file) => readFileSync(path.join(apiDir, file), "utf8"))
    : [];
  return [html, ...api].join("\n");
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
  const before = recordedInputs(dir);
  writeFileSync(path.join(dir, "page.html"), html);

  // Replace the API responses as a set, so none from an earlier recording stay.
  const apiDir = path.join(dir, "api");
  rmSync(apiDir, { recursive: true, force: true });
  if (recording.api.length) {
    mkdirSync(apiDir, { recursive: true });
    recording.api.forEach((response, i) =>
      writeFileSync(
        path.join(apiDir, `${String(i + 1).padStart(2, "0")}.json`),
        JSON.stringify(response, null, 2) + "\n",
      ),
    );
  }

  const expectedPath = path.join(dir, "expected.json");
  if (existsSync(expectedPath)) {
    // A reviewed fixture whose page changed needs reviewing again.
    const expected = JSON.parse(
      readFileSync(expectedPath, "utf8"),
    ) as FixtureExpectation;
    const changed =
      before !== recordedInputs(dir) ||
      expected.url !== url.href ||
      expected.currentYear !== currentYear;
    expected.url = url.href;
    expected.currentYear = currentYear;
    if (expected.reviewed && changed) {
      expected.reviewed = false;
      console.log("The recording changed, so expected.json is unreviewed.");
    }
    writeFileSync(expectedPath, JSON.stringify(expected, null, 2) + "\n");
  } else {
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
