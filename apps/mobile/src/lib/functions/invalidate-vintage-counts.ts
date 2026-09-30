import type { QueryClient } from "@tanstack/react-query";

// Vintage responses embed bottle counts. After bottles change, refresh only
// the cached vintage queries that hold one of the affected vintages. Callers
// know the vintage but not always its wine, so match on the cached data
// rather than on the wine-scoped query key.
export function invalidateVintageCounts(
  queryClient: QueryClient,
  vintageIds: number[],
) {
  const ids = new Set(vintageIds);
  queryClient.invalidateQueries({
    queryKey: ["vintages"],
    predicate: (query) => holdsVintage(query.state.data, ids),
  });
}

function holdsVintage(data: unknown, ids: Set<number>): boolean {
  const items = Array.isArray(data) ? data : [data];
  return items.some(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      ids.has(item.id as number),
  );
}
