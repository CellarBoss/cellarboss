import Fuse from "fuse.js";
import type {
  Country,
  Grape,
  Region,
  Wine,
  WineMaker,
} from "@cellarboss/types";
import { comparableName } from "../scrape/normalize";

export interface MatchCandidate {
  id: number;
  name: string;
}

export interface FieldMatch {
  /** Best suggested existing entity, or null if nothing matched. */
  matchId: number | null;
  /** Ranked alternatives (includes the best match), capped for the UI. */
  candidates: MatchCandidate[];
}

const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.34, // fairly strict — avoids confidently wrong matches
  keys: ["name"],
};

const MAX_CANDIDATES = 5;

function emptyMatch(): FieldMatch {
  return { matchId: null, candidates: [] };
}

/**
 * Match a scraped name against a list of existing entities. An exact
 * (accent/case/punctuation-insensitive) name always wins; otherwise a fuzzy
 * search supplies a best guess plus ranked alternatives.
 */
export function matchByName(
  value: string | null | undefined,
  entities: Array<{ id: number; name: string }>,
): FieldMatch {
  if (!value || entities.length === 0) return emptyMatch();

  const target = comparableName(value);
  if (!target) return emptyMatch();

  // Exact normalised match takes precedence over any fuzzy result.
  const exact = entities.find((e) => comparableName(e.name) === target);

  const fuse = new Fuse(entities, FUSE_OPTIONS);
  const ranked = fuse
    .search(value)
    .slice(0, MAX_CANDIDATES)
    .map((r) => ({ id: r.item.id, name: r.item.name }));

  const candidates: MatchCandidate[] = [];
  if (exact) candidates.push({ id: exact.id, name: exact.name });
  for (const c of ranked) {
    if (!candidates.some((existing) => existing.id === c.id)) {
      candidates.push(c);
    }
  }

  return {
    matchId: exact?.id ?? ranked[0]?.id ?? null,
    candidates: candidates.slice(0, MAX_CANDIDATES),
  };
}

/** Match many scraped names (e.g. grapes), one FieldMatch per input. */
export function matchManyByName(
  values: string[],
  entities: Grape[],
): FieldMatch[] {
  return values.map((v) => matchByName(v, entities));
}

/**
 * Match a region **within the resolved country**. If the country is unknown or
 * unmatched, the region is treated as new (no match), preventing the bug where
 * a region was attached to the wrong country. See PR #563 review.
 */
export function matchRegion(
  value: string | null | undefined,
  countryId: number | null,
  regions: Region[],
): FieldMatch {
  if (!value) return emptyMatch();
  if (countryId == null) return emptyMatch();
  const inCountry = regions.filter((r) => r.countryId === countryId);
  return matchByName(value, inCountry);
}

/** Match a country by name. */
export function matchCountry(
  value: string | null | undefined,
  countries: Country[],
): FieldMatch {
  return matchByName(value, countries);
}

/** Match a winemaker/producer by name. */
export function matchWinemaker(
  value: string | null | undefined,
  winemakers: WineMaker[],
): FieldMatch {
  return matchByName(value, winemakers);
}

/**
 * Match an existing wine by name, optionally scoped to a winemaker so that
 * identically-named wines from different producers don't collide.
 */
export function matchWine(
  value: string | null | undefined,
  winemakerId: number | null,
  wines: Wine[],
): FieldMatch {
  const scope =
    winemakerId == null
      ? wines
      : wines.filter((w) => w.wineMakerId === winemakerId);
  return matchByName(value, scope);
}
