import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import { parsePrice } from "../normalize";
import type { ScrapedWine } from "../types";

export type { CheerioAPI };

export function loadHtml(html: string): CheerioAPI {
  return cheerio.load(html);
}

type JsonLdNode = Record<string, unknown>;

/** Flatten every JSON-LD node on the page, expanding `@graph` containers. */
function collectJsonLd($: CheerioAPI): JsonLdNode[] {
  const nodes: JsonLdNode[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const raw = $(el).contents().text().trim();
    if (!raw) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return; // Ignore malformed JSON-LD blocks rather than failing the scrape.
    }
    const queue = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of queue) {
      if (item && typeof item === "object") {
        const node = item as JsonLdNode;
        const graph = node["@graph"];
        if (Array.isArray(graph)) {
          for (const g of graph) {
            if (g && typeof g === "object") nodes.push(g as JsonLdNode);
          }
        }
        nodes.push(node);
      }
    }
  });
  return nodes;
}

function hasType(node: JsonLdNode, type: string): boolean {
  const t = node["@type"];
  if (typeof t === "string") return t.toLowerCase() === type.toLowerCase();
  if (Array.isArray(t)) {
    return t.some(
      (x) => typeof x === "string" && x.toLowerCase() === type.toLowerCase(),
    );
  }
  return false;
}

function firstString(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    for (const v of value) {
      const s = firstString(v);
      if (s) return s;
    }
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return firstString(obj.name ?? obj.url ?? obj["@value"]);
  }
  return null;
}

function extractPriceFromOffers(offers: unknown): number | null {
  if (!offers) return null;
  const list = Array.isArray(offers) ? offers : [offers];
  for (const offer of list) {
    if (offer && typeof offer === "object") {
      const o = offer as Record<string, unknown>;
      const price = parsePrice(firstString(o.price ?? o.lowPrice));
      if (price != null) return price;
    }
  }
  return null;
}

/** Details derived from a schema.org Product node, if present. */
export function extractJsonLdProduct($: CheerioAPI): Partial<ScrapedWine> {
  const product = collectJsonLd($).find((n) => hasType(n, "Product"));
  if (!product) return {};

  const brand = product.brand;
  const winemaker = typeof brand === "string" ? brand : firstString(brand);

  return {
    name: firstString(product.name) ?? undefined,
    winemaker: winemaker ?? undefined,
    description: firstString(product.description) ?? undefined,
    imageUrl: firstString(product.image) ?? undefined,
    price: extractPriceFromOffers(product.offers) ?? undefined,
  };
}

/** Details derived from OpenGraph / product meta tags. */
export function extractOpenGraph($: CheerioAPI): Partial<ScrapedWine> {
  const meta = (property: string): string | null =>
    $(`meta[property="${property}"], meta[name="${property}"]`)
      .attr("content")
      ?.trim() || null;

  return {
    name: meta("og:title") ?? undefined,
    imageUrl: meta("og:image") ?? undefined,
    description: meta("og:description") ?? undefined,
    price: parsePrice(meta("product:price:amount")) ?? undefined,
  };
}

/**
 * Pull a JSON object literal out of an inline `<script>`, given the text that
 * immediately precedes its opening brace (e.g. `const product =`). Many
 * client-rendered retailers hydrate the page from a blob like this instead of
 * exposing schema.org metadata, so this is the only reliable source of the
 * structured fields. Braces inside string literals are handled, and the result
 * is `null` if the marker is missing or the object can't be parsed.
 */
export function extractInlineObject(
  html: string,
  marker: string | RegExp,
): Record<string, unknown> | null {
  const re =
    typeof marker === "string"
      ? new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      : marker;
  const match = re.exec(html);
  if (!match) return null;

  const start = html.indexOf("{", match.index + match[0].length);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < html.length; i++) {
    const ch = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) {
      try {
        return JSON.parse(html.slice(start, i + 1)) as Record<string, unknown>;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Read a value from a spec list keyed by label text. Handles the common
 * markup shapes: `<dt>/<dd>` definition lists, `<th>/<td>` table rows, and
 * generic `label`/`value` element pairs marked with data attributes.
 */
export function extractSpecValue(
  $: CheerioAPI,
  labels: string[],
): string | null {
  const wanted = labels.map((l) => l.toLowerCase());
  const matches = (text: string) =>
    wanted.some((w) => text.toLowerCase().replace(/[:\s]+$/, "") === w);

  let found: string | null = null;

  // <dt>Region</dt><dd>Bordeaux</dd>
  $("dt").each((_, el) => {
    if (found) return;
    if (matches($(el).text().trim())) {
      const value = $(el).next("dd").text().trim();
      if (value) found = value;
    }
  });
  if (found) return found;

  // <tr><th>Region</th><td>Bordeaux</td></tr>
  $("tr").each((_, el) => {
    if (found) return;
    const label = $(el).find("th, td").first().text().trim();
    if (matches(label)) {
      const value = $(el).find("td").last().text().trim();
      if (value && value.toLowerCase() !== label.toLowerCase()) found = value;
    }
  });
  if (found) return found;

  // <li><span class="label">Region</span><span>Bordeaux</span></li>
  $("[data-label], .label, .spec-label, .attribute-label").each((_, el) => {
    if (found) return;
    if (matches($(el).text().trim())) {
      const value =
        $(el).next().text().trim() ||
        $(el).parent().find("a").first().text().trim();
      if (value) found = value;
    }
  });

  return found;
}

/** Merge JSON-LD and OpenGraph, preferring the richer JSON-LD values. */
export function extractCommon($: CheerioAPI): Partial<ScrapedWine> {
  const og = extractOpenGraph($);
  const jsonLd = extractJsonLdProduct($);
  return {
    name: jsonLd.name ?? og.name,
    winemaker: jsonLd.winemaker ?? og.winemaker,
    description: jsonLd.description ?? og.description,
    imageUrl: jsonLd.imageUrl ?? og.imageUrl,
    price: jsonLd.price ?? og.price,
  };
}
