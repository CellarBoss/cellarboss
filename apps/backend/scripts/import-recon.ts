/**
 * Records a real product page as an import fixture. Development only.
 *
 *   pnpm --filter @cellarboss/backend import:recon <url> [--name <slug>]
 *   pnpm --filter @cellarboss/backend import:recon <url> --html <saved-page.html>
 *
 * Without --html it loads the page once in Chromium (Playwright), keeping the
 * HTML as served. With --html it uses a page saved from your own browser
 * instead, for sites that need a login or block automated browsers. Either
 * way it then fetches the importer's `apiRequests()`, as the backend would.
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
import {
  buildContext,
  ImporterRegistry,
  type BaseImporter,
} from "../src/import/index.js";
import { readAssignment } from "../src/import/extractors/index.js";
import {
  summarise,
  type FixtureExpectation,
} from "../src/import/__tests__/fixture-summary.js";

interface Api {
  url: string;
  body: string;
}

const FIXTURES = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../src/import/__tests__/fixtures",
);
const USER_AGENT =
  "Mozilla/5.0 (compatible; CellarBoss/dev; +https://cellarboss.org) import-recon";

/** Loads the page once in Chromium and keeps the HTML as served. */
async function recordPage(url: URL): Promise<string> {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
  });
  try {
    const page = await browser.newPage({ userAgent: USER_AGENT });
    const main = await page.goto(url.href, {
      waitUntil: "load",
      timeout: 60_000,
    });
    if (!main?.ok())
      throw new Error(`Page returned HTTP ${main?.status() ?? "no response"}`);
    return await main.text();
  } finally {
    await browser.close();
  }
}

/**
 * Fetches the importer's own API requests, as the backend would: first
 * those it can make from the URL alone, then those it reads from the page.
 * Other JSON the page loads (reviews, baskets) is never recorded.
 */
async function recordApi(
  importer: BaseImporter,
  url: URL,
  html: string,
): Promise<Api[]> {
  const requests = [
    ...importer.apiRequests(buildContext({ url, html: "" })),
    ...importer.apiRequests(buildContext({ url, html })),
  ];
  const unique = [...new Map(requests.map((u) => [u.href, u])).values()];
  if (!unique.length) return [];

  const { request } = await import("playwright-core");
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const context = await request.newContext({
    userAgent: USER_AGENT,
    extraHTTPHeaders: { accept: "application/json" },
    proxy: proxy ? { server: proxy } : undefined,
  });
  try {
    const api: Api[] = [];
    for (const apiUrl of unique) {
      const response = await context.get(apiUrl.href, { timeout: 30_000 });
      if (!response.ok()) {
        console.warn(`API ${apiUrl.href} returned HTTP ${response.status()}`);
        continue;
      }
      api.push({ url: apiUrl.href, body: await response.text() });
    }
    return api;
  } finally {
    await context.dispose();
  }
}

/**
 * Keeps what the extractors read and drops the rest of the retailer's page.
 * Inline scripts are dropped too, except the objects the importer reads,
 * which are kept on their own.
 */
function trim(html: string, url: URL, importer: BaseImporter): string {
  const $ = load(html);
  $("script")
    .not(
      '[type="application/ld+json"], [type="application/json"], #__NEXT_DATA__',
    )
    .each((_, el) => {
      const script = $(el);
      const kept = script.attr("src")
        ? []
        : importer.inlineObjects.flatMap((name) => {
            const value = readAssignment(script.text(), name);
            return value === undefined
              ? []
              : [`const ${name} = ${JSON.stringify(value)};`];
          });
      if (kept.length)
        script.replaceWith(`<script>${kept.join("\n")}</script>`);
      else script.remove();
    });
  // Icons can label facts (The Wine Society's characteristics), so keep
  // which icon each one is but not its drawing.
  $("svg").each((_, el) => {
    const use = $(el).find("use").first();
    const icon = use.attr("href") ?? use.attr("xlink:href");
    if (icon)
      $(el).replaceWith(
        `<svg><use xlink:href="${icon.replace(/"/g, "&quot;")}"></use></svg>`,
      );
    else $(el).remove();
  });
  $("style, noscript, iframe, link, template").remove();
  $.root()
    .find("*")
    .addBack()
    .contents()
    .filter((_, node) => node.type === "comment")
    .remove();
  // Server-rendered app state (Vivino's data-ssr-props runs to megabytes)
  // isn't read by any extractor, so long attribute values go.
  $("*").each((_, el) => {
    if (!("attribs" in el)) return;
    for (const [name, value] of Object.entries(el.attribs)) {
      if (value.length > 10_000) $(el).removeAttr(name);
    }
  });
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
  const importer = new ImporterRegistry().forUrl(url);
  const served = values.html
    ? readFileSync(values.html, "utf8")
    : await recordPage(url);
  const api = await recordApi(importer, url, served);

  const html = trim(served, url, importer);
  const currentYear = new Date().getFullYear();
  const ctx = buildContext({ url, html, api, currentYear });
  const wine = importer.extract(ctx);

  const dir = path.join(FIXTURES, importer.id, values.name ?? slugFor(url));
  mkdirSync(dir, { recursive: true });
  const before = recordedInputs(dir);
  writeFileSync(path.join(dir, "page.html"), html);

  // Replace the API responses as a set, so none from an earlier recording stay.
  const apiDir = path.join(dir, "api");
  rmSync(apiDir, { recursive: true, force: true });
  if (api.length) {
    mkdirSync(apiDir, { recursive: true });
    api.forEach((response, i) =>
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
    if (expected.reviewed && before !== recordedInputs(dir)) {
      expected.reviewed = false;
      writeFileSync(expectedPath, JSON.stringify(expected, null, 2) + "\n");
      console.log("The recorded page changed, so expected.json is unreviewed.");
    }
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
    `JSON-LD blocks: ${ctx.jsonLd.length}, embedded JSON: ${ctx.embeddedJson.length}, API responses: ${api.length}`,
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
