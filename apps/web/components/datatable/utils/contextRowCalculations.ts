import { Row } from "@tanstack/react-table";

/**
 * For hierarchical data (with subrows), when a subrow is visible on the current page,
 * we need to also render its parent rows (even if they're not on the current page themselves)
 * to show the proper hierarchy context.
 */
export function getContextRows<T>(
  pageRows: Row<T>[],
  getSubRows?: (row: T) => T[] | undefined,
): Row<T>[] {
  const contextRows: Row<T>[] = [];

  if (!getSubRows) {
    return contextRows;
  }

  const pageRowIds = new Set(pageRows.map((r) => r.id));
  const seenContextIds = new Set<string>();

  for (const row of pageRows) {
    for (const ancestor of row.getParentRows()) {
      if (!pageRowIds.has(ancestor.id) && !seenContextIds.has(ancestor.id)) {
        contextRows.push(ancestor);
        seenContextIds.add(ancestor.id);
      }
    }
  }

  return contextRows;
}
