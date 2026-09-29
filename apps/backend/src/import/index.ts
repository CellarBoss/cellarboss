/**
 * Import wine details from a web page. Everything in this folder is pure:
 * it parses and matches but never touches the network or the database, so
 * it can be tested against saved pages. The backend's fetcher and routes do
 * the I/O. See README.md for how to add a site.
 */
export { buildContext, type BuildContextInput } from "./context.js";
export { BaseImporter, type RequiredField } from "./base-importer.js";
export { ImporterRegistry, type SupportedSite } from "./registry.js";
export { GenericImporter } from "./sites/generic.js";
export { defineLabelTableImporter } from "./sites/define-label-table.js";
export {
  matchByName,
  type Resolution,
  type MatchOptions,
} from "./reconcile/match.js";
export { foldKey } from "./normalise/text.js";
export {
  reconcileWine,
  type ReconcileLookups,
  type WineResolution,
} from "./reconcile/wine.js";
export type * from "./types.js";
