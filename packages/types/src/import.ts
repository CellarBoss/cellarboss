import type { Wine } from "./wine";

/** Where an imported value came from. */
export type ImportFieldSource =
  | "api"
  | "site"
  | "json-ld"
  | "microdata"
  | "label-table"
  | "open-graph"
  | "heuristic";

/** An imported value, where it came from and how sure the importer is (0–1). */
export interface ImportField<T> {
  value: T;
  source: ImportFieldSource;
  confidence: number;
}

/** Wine and vintage details read from a page. */
export interface ImportedWineDetails {
  sourceUrl: string;
  importerId: string;
  /** The page's own title, for showing as a hint. */
  title?: ImportField<string>;
  name?: ImportField<string>;
  type?: ImportField<Wine["type"]>;
  winemaker?: ImportField<string>;
  country?: ImportField<string>;
  /** Most specific first, e.g. ["Haut-Médoc", "Bordeaux"]. */
  regions?: ImportField<string[]>;
  grapes?: ImportField<string[]>;
  vintage?: {
    year?: ImportField<number | null>;
    drinkFrom?: ImportField<number>;
    drinkUntil?: ImportField<number>;
  };
  imageUrl?: ImportField<string>;
}

export interface ImportCandidate {
  id: number;
  name: string;
  score: number;
}

/** How an imported name relates to existing records. */
export type ImportResolution =
  | { status: "matched"; id: number; name: string; score: number }
  | { status: "suggested"; proposedName: string; candidates: ImportCandidate[] }
  | { status: "new"; proposedName: string }
  | { status: "absent" };

export interface ImportPreview {
  wine: ImportedWineDetails;
  resolution: {
    winemaker: ImportResolution;
    country: ImportResolution;
    region: ImportResolution;
    grapes: ImportResolution[];
  };
  /** The wine and vintage when they already exist, so the page can offer them instead. */
  existing: {
    wine: { id: number; name: string } | null;
    vintage: { id: number; year: number | null } | null;
  };
}

export interface ImportSite {
  id: string;
  label: string;
  hosts: string[];
}

/** An existing record by id, or a new one by name. */
export type ImportEntityRef = { id: number } | { name: string };

export interface ImportCommit {
  /** An existing wine to add the vintage to, or a new wine. */
  wine:
    | { id: number }
    | {
        name: string;
        type: Wine["type"];
        winemaker: ImportEntityRef;
        /** Needed when the region is new. */
        country: ImportEntityRef | null;
        region: ImportEntityRef | null;
        grapes: ImportEntityRef[];
      };
  vintage: {
    year: number | null;
    drinkFrom: number | null;
    drinkUntil: number | null;
  };
}

export interface ImportCommitResult {
  wineId: number;
  vintageId: number;
  /** False when the vintage already existed and nothing was created. */
  created: boolean;
}
