import { WINE_TYPES, type WineType } from "@cellarboss/validators/constants";

export type ImportedWineDetails = {
  sourceUrl: string;
  sourceTitle: string | null;
  name: string | null;
  type: WineType | null;
  vintageYear: number | null;
  winemakerName: string | null;
  regionName: string | null;
  countryName: string | null;
  grapeNames: string[];
};

type JsonLdNode = Record<string, unknown>;

const COMMON_GRAPE_NAMES = [
  "Cabernet Sauvignon",
  "Merlot",
  "Pinot Noir",
  "Chardonnay",
  "Sauvignon Blanc",
  "Riesling",
  "Syrah",
  "Shiraz",
  "Sangiovese",
  "Malbec",
  "Tempranillo",
  "Grenache",
  "Nebbiolo",
  "Pinot Grigio",
  "Pinot Gris",
  "Chenin Blanc",
  "Zinfandel",
  "Viognier",
  "Gamay",
  "Mourvedre",
  "Mourvèdre",
  "Gewurztraminer",
  "Gewürztraminer",
] as const;

export function extractWineDetailsFromHtml(
  html: string,
  sourceUrl: string,
): ImportedWineDetails {
  const metadata = extractMetadata(html);
  const jsonLdNodes = extractJsonLdNodes(html);
  const wineNode = findWineNode(jsonLdNodes);

  const title = firstText(
    getPath(wineNode, ["name"]),
    metadata["og:title"],
    metadata["twitter:title"],
    metadata.title,
  );
  const description = firstText(
    getPath(wineNode, ["description"]),
    metadata["og:description"],
    metadata.description,
  );
  const combinedText = [title, description, sourceUrl]
    .filter(Boolean)
    .join(" ");

  const rawName = firstText(
    getPath(wineNode, ["name"]),
    metadata["og:title"],
    metadata["twitter:title"],
    metadata.title,
  );
  const sourceTitle = cleanText(metadata["og:title"] ?? metadata.title ?? null);

  return {
    sourceUrl,
    sourceTitle,
    name: cleanWineName(rawName, sourceTitle),
    type: detectWineType(combinedText),
    vintageYear: extractVintageYear(combinedText),
    winemakerName: firstText(
      getPath(wineNode, ["brand", "name"]),
      getPath(wineNode, ["manufacturer", "name"]),
      getPath(wineNode, ["producer", "name"]),
      getPath(wineNode, ["creator", "name"]),
      getPath(wineNode, ["seller", "name"]),
    ),
    regionName: firstText(
      getPath(wineNode, ["productionPlace", "address", "addressRegion"]),
      getPath(wineNode, ["productionPlace", "name"]),
      getPath(wineNode, ["originAddress", "addressRegion"]),
      getPath(wineNode, ["address", "addressRegion"]),
      getPath(wineNode, ["appellation"]),
    ),
    countryName: firstText(
      getPath(wineNode, ["countryOfOrigin", "name"]),
      getPath(wineNode, ["productionPlace", "address", "addressCountry"]),
      getPath(wineNode, ["originAddress", "addressCountry"]),
      getPath(wineNode, ["address", "addressCountry"]),
    ),
    grapeNames: extractGrapeNames(wineNode, combinedText),
  };
}

export function buildWineImportDraft<T extends { id: number; name: string }>(
  details: ImportedWineDetails,
  resources: {
    winemakers: T[];
    regions: (T & { countryId?: number })[];
    countries: T[];
    grapes: T[];
  },
) {
  const country = matchByName(resources.countries, details.countryName);
  const region = matchByName(resources.regions, details.regionName, {
    countryId: country?.id,
  });
  const winemaker = matchByName(resources.winemakers, details.winemakerName);
  const grapes = details.grapeNames
    .map((name) => matchByName(resources.grapes, name))
    .filter((grape): grape is T => Boolean(grape));

  return {
    data: {
      id: 0,
      name: details.name ?? "",
      type: details.type ?? "red",
      wineMakerId: winemaker?.id ?? "",
      regionId: region?.id ?? "",
      grapeIds: grapes.map((grape) => grape.id),
    },
    matches: {
      country,
      region,
      winemaker,
      grapes,
    },
    unmatched: {
      countryName: details.countryName && !country ? details.countryName : null,
      regionName: details.regionName && !region ? details.regionName : null,
      winemakerName:
        details.winemakerName && !winemaker ? details.winemakerName : null,
      grapeNames: details.grapeNames.filter(
        (name) =>
          !resources.grapes.some((grape) => isNameMatch(grape.name, name)),
      ),
    },
  };
}

function extractMetadata(html: string): Record<string, string> {
  const metadata: Record<string, string> = {};
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    metadata.title = decodeHtml(titleMatch[1]);
  }

  const metaRegex = /<meta\b([^>]*)>/gi;
  let match: RegExpExecArray | null;
  while ((match = metaRegex.exec(html))) {
    const attrs = parseAttributes(match[1] ?? "");
    const key = attrs.property ?? attrs.name;
    const content = attrs.content;
    if (key && content) {
      metadata[key.toLowerCase()] = decodeHtml(content);
    }
  }

  return metadata;
}

function parseAttributes(input: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z_:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(input))) {
    const key = match[1]?.toLowerCase();
    const value = match[2] ?? match[3] ?? match[4];
    if (key && value) {
      attrs[key] = value;
    }
  }
  return attrs;
}

function extractJsonLdNodes(html: string): JsonLdNode[] {
  const nodes: JsonLdNode[] = [];
  const scriptRegex =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = scriptRegex.exec(html))) {
    const scriptBody = decodeHtml(match[1] ?? "").trim();
    if (!scriptBody) continue;

    try {
      flattenJsonLd(JSON.parse(scriptBody), nodes);
    } catch {
      continue;
    }
  }

  return nodes;
}

function flattenJsonLd(value: unknown, nodes: JsonLdNode[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => flattenJsonLd(item, nodes));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  nodes.push(value);

  const graph = value["@graph"];
  if (Array.isArray(graph)) {
    graph.forEach((item) => flattenJsonLd(item, nodes));
  }
}

function findWineNode(nodes: JsonLdNode[]): JsonLdNode | undefined {
  return (
    nodes.find((node) => hasType(node, "Wine")) ??
    nodes.find((node) => hasType(node, "Product")) ??
    nodes.find((node) => typeof node.name === "string")
  );
}

function hasType(node: JsonLdNode, type: string): boolean {
  const rawType = node["@type"];
  if (Array.isArray(rawType)) {
    return rawType.some(
      (value) => String(value).toLowerCase() === type.toLowerCase(),
    );
  }
  return String(rawType).toLowerCase() === type.toLowerCase();
}

function getPath(source: unknown, path: string[]): unknown {
  let current = source;
  for (const key of path) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function firstText(...values: unknown[]): string | null {
  for (const value of values) {
    const text = normalizeText(value);
    if (text) return text;
  }
  return null;
}

function normalizeText(value: unknown): string | null {
  if (typeof value === "string") {
    return cleanText(value);
  }
  if (Array.isArray(value)) {
    return firstText(...value);
  }
  if (isRecord(value)) {
    return firstText(value.name, value.value, value.text);
  }
  return null;
}

function cleanText(value: string | null): string | null {
  const cleaned = value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}

function cleanWineName(
  rawName: string | null,
  sourceTitle: string | null,
): string | null {
  const fallback = rawName ?? sourceTitle;
  if (!fallback) return null;

  const withoutSite = fallback
    .split(/\s+[|–-]\s+/)[0]
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return withoutSite || fallback;
}

function detectWineType(input: string): WineType | null {
  const text = input.toLowerCase();
  const checks: Array<[WineType, RegExp]> = [
    ["sparkling", /\b(sparkling|champagne|prosecco|cava)\b/],
    ["fortified", /\b(fortified|port|sherry|madeira)\b/],
    ["dessert", /\b(dessert|sauternes|ice wine|late harvest)\b/],
    ["orange", /\borange wine\b/],
    ["rose", /\b(rosé|rose wine|rose)\b/],
    ["white", /\b(white wine|white)\b/],
    ["red", /\b(red wine|red)\b/],
  ];

  return checks.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}

function extractVintageYear(input: string): number | null {
  const match = input.match(/\b(19[5-9]\d|20\d{2})\b/);
  return match?.[1] ? Number(match[1]) : null;
}

function extractGrapeNames(node: JsonLdNode | undefined, fallbackText: string) {
  const candidates = [
    getPath(node, ["varietal"]),
    getPath(node, ["variety"]),
    getPath(node, ["grape"]),
    getPath(node, ["material"]),
    getPath(node, ["category"]),
    getPath(node, ["additionalProperty"]),
    fallbackText,
  ];

  const combined = candidates
    .map((candidate) => JSON.stringify(candidate))
    .filter(Boolean)
    .join(" ");

  return COMMON_GRAPE_NAMES.filter((grape) =>
    new RegExp(`\\b${escapeRegex(grape)}\\b`, "i").test(combined),
  );
}

function matchByName<T extends { id: number; name: string }>(
  resources: T[],
  name: string | null,
  constraints?: { countryId?: number },
): T | undefined {
  if (!name) return undefined;
  return resources.find((resource) => {
    if (
      constraints?.countryId &&
      "countryId" in resource &&
      resource.countryId !== constraints.countryId
    ) {
      return false;
    }
    return isNameMatch(resource.name, name);
  });
}

function isNameMatch(left: string, right: string): boolean {
  const normalizedLeft = normalizeName(left);
  const normalizedRight = normalizeName(right);
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.includes(normalizedRight) ||
    normalizedRight.includes(normalizedLeft)
  );
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .replace(/\b(the|wine|wines|winery|vineyard|vineyards)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isRecord(value: unknown): value is JsonLdNode {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSupportedWineType(value: string): value is WineType {
  return WINE_TYPES.includes(value as WineType);
}
