import type {
  BottleSize,
  BottleStatus,
  WineType,
} from "@cellarboss/validators/constants";
import type { ScrapedWine } from "./scrape";
import type { MatchCandidate } from "./match/matcher";

/**
 * Result of stage 1 + 2 (scrape + match). The UI loads full entity lists
 * itself; this only carries the scraped values and the *suggested* existing
 * ids so selects can be pre-populated.
 */
export interface ImportDraft {
  sourceUrl: string;
  adapterId: string;
  adapterLabel: string;
  scraped: ScrapedWine;
  suggestions: {
    wineId: number | null;
    countryId: number | null;
    regionId: number | null;
    winemakerId: number | null;
    grapeIds: Array<number | null>;
    candidates: {
      country: MatchCandidate[];
      region: MatchCandidate[];
      winemaker: MatchCandidate[];
      wine: MatchCandidate[];
    };
  };
}

/**
 * A reconciled entity: either an existing record (`existingId`) or a new one to
 * be created with `newName`. Exactly one is set.
 */
export interface ResolvedEntity {
  existingId: number | null;
  newName: string | null;
}

/** Full payload the UI submits to stage 3 + 4 (create dependents + bottles). */
export interface ReconciledImport {
  /** When set, attach the vintage to this existing wine and ignore the
   *  wine/winemaker/region/grape resolutions below. */
  existingWineId: number | null;
  wine: {
    name: string;
    type: WineType;
  };
  /** Required when creating a new wine; ignored when `existingWineId` is set. */
  winemaker: ResolvedEntity | null;
  /** Country is only needed when a new region must be created. */
  country: ResolvedEntity | null;
  region: ResolvedEntity | null;
  grapes: ResolvedEntity[];
  vintage: {
    year: number | null;
    drinkFrom: number | null;
    drinkUntil: number | null;
  };
  bottle: {
    purchaseDate: string;
    purchasePrice: number;
    storageId: number | null;
    status: BottleStatus;
    size: BottleSize;
    quantity: number;
  };
}

export interface ImportResult {
  wineId: number;
  vintageId: number;
  bottleIds: number[];
}
