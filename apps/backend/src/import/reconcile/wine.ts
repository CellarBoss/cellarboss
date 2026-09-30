import type { Country, Grape, Region, WineMaker } from "@cellarboss/types";
import {
  COUNTRY_ALIASES,
  GRAPE_ALIASES,
  REGION_ALIASES,
} from "../normalise/aliases.js";
import type { ImportedWine } from "../types.js";
import { matchByName, type Resolution } from "./match.js";

export interface ReconcileLookups {
  winemakers: WineMaker[];
  countries: Country[];
  regions: Region[];
  grapes: Grape[];
}

export interface WineResolution {
  winemaker: Resolution;
  country: Resolution;
  region: Resolution;
  grapes: Resolution[];
}

/** Words that retailers add to producer names and CellarBoss users usually don't. */
const WINEMAKER_IGNORE_WORDS = [
  "estate",
  "estates",
  "winery",
  "wines",
  "vineyards",
  "vineyard",
  "cellars",
];

/** Matches an imported wine's winemaker, country, region and grapes to existing records. */
export function reconcileWine(
  wine: ImportedWine,
  lookups: ReconcileLookups,
): WineResolution {
  const winemaker = matchByName(wine.winemaker?.value, lookups.winemakers, {
    ignoreWords: WINEMAKER_IGNORE_WORDS,
  });

  let country = matchByName(wine.country?.value, lookups.countries, {
    aliases: COUNTRY_ALIASES,
  });

  const region = reconcileRegion(
    wine.regions?.value ?? [],
    country,
    lookups.regions,
  );

  // A matched region implies its country when the page didn't name one.
  if (country.status === "absent" && region.status === "matched") {
    const regionCountryId = lookups.regions.find(
      (r) => r.id === region.id,
    )?.countryId;
    const inferred = lookups.countries.find((c) => c.id === regionCountryId);
    if (inferred)
      country = {
        status: "matched",
        id: inferred.id,
        name: inferred.name,
        score: 1,
      };
  }

  const grapes: Resolution[] = [];
  const seen = new Set<number>();
  for (const name of wine.grapes?.value ?? []) {
    const resolution = matchByName(name, lookups.grapes, {
      aliases: GRAPE_ALIASES,
    });
    if (resolution.status === "matched") {
      if (seen.has(resolution.id)) continue;
      seen.add(resolution.id);
    }
    grapes.push(resolution);
  }

  return { winemaker, country, region, grapes };
}

/**
 * Regions are flat, so the page's list ("Haut-Médoc", "Bordeaux") is tried
 * from most to least specific and the first existing match wins. Without a
 * match, a suggestion for the broadest part is offered, then a new region.
 * Regions only match within the resolved country; a new country means every
 * region is new.
 */
function reconcileRegion(
  names: string[],
  country: Resolution,
  regions: Region[],
): Resolution {
  if (names.length === 0) return { status: "absent" };
  const broadest = names[names.length - 1];

  if (country.status === "new")
    return { status: "new", proposedName: broadest };

  // With a suggested country, look within its best candidate.
  const countryId =
    country.status === "matched"
      ? country.id
      : country.status === "suggested"
        ? country.candidates[0].id
        : undefined;
  const options = {
    aliases: REGION_ALIASES,
    scope:
      countryId === undefined
        ? undefined
        : (r: Region) => r.countryId === countryId,
  };

  const results = names.map((name) => matchByName(name, regions, options));
  const matched = results.find((r) => r.status === "matched");
  if (matched) return matched;

  const suggested = [...results]
    .reverse()
    .find((r) => r.status === "suggested");
  return suggested ?? { status: "new", proposedName: broadest };
}
