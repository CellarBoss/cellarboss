import {
  jsonLd,
  labelTable,
  microdata,
  openGraph,
} from "./extractors/index.js";
import { mergeByPrecedence } from "./merge.js";
import { normalise } from "./normalise/index.js";
import type {
  Extractor,
  ImportContext,
  ImportedWine,
  RawWine,
  Strategy,
} from "./types.js";

/** Fields an import needs before the backend stops trying further strategies. */
export type RequiredField = "name" | "winemaker" | "type" | "vintage";

/**
 * The generic base for every importer. It runs the generic extractors, lets
 * a subclass add site knowledge on top, merges by confidence and normalises.
 * Site adapters override only what their site needs.
 */
export abstract class BaseImporter {
  abstract readonly id: string;
  /** Shown to users, e.g. "The Wine Society". */
  abstract readonly label: string;
  /** Hosts this importer handles; subdomains match too. */
  abstract readonly hosts: string[];

  /** Fetch strategies to try, in order. */
  readonly strategies: Strategy[] = ["http", "supplied"];

  readonly required: RequiredField[] = ["name"];

  /**
   * Variables assigned JSON in the page's inline scripts that this importer
   * reads, e.g. "product" for `const product = {...}`. The recon script keeps
   * these when it trims a recorded page.
   */
  readonly inlineObjects: string[] = [];

  canHandle(url: URL): boolean {
    const host = url.hostname.toLowerCase();
    return this.hosts.some((h) => host === h || host.endsWith(`.${h}`));
  }

  /**
   * Same-host JSON endpoints for the "api" strategy, e.g. Vivino's
   * /api/vintages/{id}. Called first with an empty page, and again once the
   * page has been fetched, so an adapter can read ids from the HTML.
   */
  apiRequests(ctx: ImportContext): URL[] {
    void ctx;
    return [];
  }

  /** Generic extractors, lowest precedence first. Override to reorder or drop. */
  protected extractors(): Extractor[] {
    return [openGraph, microdata, labelTable, jsonLd];
  }

  /** Fields read from the responses of `apiRequests()`. */
  protected extractApi(ctx: ImportContext): RawWine {
    void ctx;
    return {};
  }

  /** Site-specific knowledge of the page. */
  protected extractSite(ctx: ImportContext): RawWine {
    void ctx;
    return {};
  }

  extract(ctx: ImportContext): ImportedWine {
    const layers = [
      ...this.extractors().map((extract) => extract(ctx)),
      this.extractSite(ctx),
      this.extractApi(ctx),
    ];
    const wine = normalise(mergeByPrecedence(layers), {
      currentYear: ctx.currentYear,
      baseUrl: ctx.url,
    });

    for (const field of this.missing(wine)) {
      wine.diagnostics.push({
        level: "warn",
        code: "missing_required",
        message: `Required field "${field}" not found`,
      });
    }
    return { sourceUrl: ctx.url.href, importerId: this.id, ...wine };
  }

  /** Required fields the result doesn't have. */
  missing(
    wine: Omit<ImportedWine, "sourceUrl" | "importerId">,
  ): RequiredField[] {
    return this.required.filter((field) =>
      field === "vintage" ? wine.vintage?.year === undefined : !wine[field],
    );
  }
}
