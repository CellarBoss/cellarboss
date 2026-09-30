import type { ImportedWine } from "../types.js";

/** The fields a recorded page is checked on, as plain values. */
export interface FixtureFields {
  name?: string;
  winemaker?: string;
  country?: string;
  regions?: string[];
  grapes?: string[];
  type?: string;
  vintage?: number | null;
  drinkFrom?: number;
  drinkUntil?: number;
}

export interface FixtureExpectation {
  url: string;
  importer: string;
  recordedAt: string;
  /** "Now" in a drinking window means this year, so results don't drift. */
  currentYear: number;
  reviewed: boolean;
  /** What the import gets wrong or leaves out on this page, and why. */
  notes?: string;
  fields: FixtureFields;
}

export function summarise(wine: ImportedWine): FixtureFields {
  const fields: FixtureFields = {
    name: wine.name?.value,
    winemaker: wine.winemaker?.value,
    country: wine.country?.value,
    regions: wine.regions?.value,
    grapes: wine.grapes?.value,
    type: wine.type?.value,
    vintage: wine.vintage?.year?.value,
    drinkFrom: wine.vintage?.drinkFrom?.value,
    drinkUntil: wine.vintage?.drinkUntil?.value,
  };
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as FixtureFields;
}
