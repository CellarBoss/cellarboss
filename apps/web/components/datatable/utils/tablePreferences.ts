/**
 * Shared helpers for per-user DataTable preference storage. Used by column
 * visibility and (future) column ordering. Keys are grouped per table as
 * `datatable.<tableId>.<...parts>` so related settings sit under one prefix.
 */

const TABLE_PREFERENCE_ROOT = "datatable";

/**
 * Normalise an arbitrary table identifier (usually a pathname) into a key-safe
 * dotted id. Path separators ("/" and ".") map to hierarchy levels; any other
 * punctuation within a level is stripped (not promoted to a new level). Each
 * level is lowercased and prefixed with a letter if it starts with a digit, so
 * the preference key stays valid against the backend validator
 * (`^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$`) for any route shape, e.g.
 * "/tasting-notes" -> "tastingnotes", "/wines/2020" -> "wines.t2020".
 */
export function normaliseTableId(raw: string): string {
  const segments = raw
    .split(/[/.]+/) // "/" and "." delimit hierarchy levels
    .map((level) => level.toLowerCase().replace(/[^a-z0-9]/g, "")) // strip the rest
    .filter(Boolean)
    .map((level) => (/^[a-z]/.test(level) ? level : `t${level}`));
  return segments.length > 0 ? segments.join(".") : "root";
}

/**
 * Build a per-user preference key for a table, grouped per table:
 * `datatable.<tableId>.<part>...`. `tableId` is expected to already be
 * normalised via {@link normaliseTableId}.
 */
export function tablePreferenceKey(
  tableId: string,
  ...parts: string[]
): string {
  return [TABLE_PREFERENCE_ROOT, tableId, ...parts].join(".");
}
