import Fuse from "fuse.js";
import type {
  GenericType,
  ImportCandidate,
  ImportResolution,
} from "@cellarboss/types";
import { foldKey } from "../normalise/text.js";

export type Candidate = ImportCandidate;

/** How an imported name relates to existing records. */
export type Resolution = ImportResolution;

export interface MatchOptions<T extends GenericType = GenericType> {
  /** Alternative names, e.g. { shiraz: "Syrah" }. Compared on folded keys. */
  aliases?: Record<string, string>;
  /** Words ignored when comparing, e.g. "estate" for winemakers. */
  ignoreWords?: string[];
  /** Only candidates passing this filter are considered, e.g. regions of one country. */
  scope?: (candidate: T) => boolean;
  /** Fuse.js distance (0 exact, 1 anything) below which a candidate is suggested. */
  threshold?: number;
  maxSuggestions?: number;
}

const DEFAULT_THRESHOLD = 0.35;

function keyFor(name: string, ignoreWords: string[]): string {
  const key = foldKey(name);
  const trimmed = key
    .split(" ")
    .filter((word) => !ignoreWords.includes(word))
    .join(" ");
  return trimmed || key;
}

/**
 * Matches a name against existing records of any `GenericType`. An exact
 * folded match or an alias gives "matched"; a close fuzzy match gives
 * "suggested" with the best candidates; anything else is "new".
 */
export function matchByName<T extends GenericType>(
  name: string | undefined,
  records: T[],
  options: MatchOptions<T> = {},
): Resolution {
  if (!name?.trim()) return { status: "absent" };

  const ignore = (options.ignoreWords ?? []).map(foldKey);
  const pool = (options.scope ? records.filter(options.scope) : records).map(
    (record) => ({
      id: record.id,
      name: record.name,
      key: keyFor(record.name, ignore),
    }),
  );

  const key = keyFor(name, ignore);
  const aliasTarget = Object.entries(options.aliases ?? {}).find(
    ([alias]) => foldKey(alias) === foldKey(name),
  )?.[1];
  const wanted = [key, ...(aliasTarget ? [keyFor(aliasTarget, ignore)] : [])];

  for (const want of wanted) {
    const exact = pool.find((candidate) => candidate.key === want);
    if (exact)
      return { status: "matched", id: exact.id, name: exact.name, score: 1 };
  }

  const fuse = new Fuse(pool, {
    keys: ["key"],
    includeScore: true,
    ignoreLocation: true,
    threshold: options.threshold ?? DEFAULT_THRESHOLD,
  });
  const candidates = fuse
    .search(key)
    .filter(({ item }) => isPlausible(key, item.key))
    .slice(0, options.maxSuggestions ?? 3)
    .map(({ item, score }) => ({
      id: item.id,
      name: item.name,
      score: Math.round((1 - (score ?? 1)) * 100) / 100,
    }));

  const proposedName = name.trim();
  return candidates.length
    ? { status: "suggested", proposedName, candidates }
    : { status: "new", proposedName };
}

/**
 * Fuse scores substrings, so "Xarel lo" scores well against "Sciaccarello".
 * A suggestion must either contain the other name's words ("Cissac" and
 * "Chateau Cissac") or be a similar length (a typo such as "Pinot Nior").
 */
function isPlausible(query: string, candidate: string): boolean {
  const q = query.split(" ");
  const c = candidate.split(" ");
  if (q.every((w) => c.includes(w)) || c.every((w) => q.includes(w)))
    return true;
  return (
    Math.min(query.length, candidate.length) /
      Math.max(query.length, candidate.length) >=
    0.75
  );
}
