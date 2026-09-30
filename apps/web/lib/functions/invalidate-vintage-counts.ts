import type { QueryClient } from "@tanstack/react-query";
import type { Vintage } from "@cellarboss/types";

// Wine and vintage responses embed tasting note and bottle counts. After a
// note or bottle changes, refresh only the cached entries that carry counts
// for its vintage: that vintage, its wine, and the lists containing either.
export function invalidateVintageCounts(
  queryClient: QueryClient,
  vintage: Pick<Vintage, "id" | "wineId">,
) {
  const queryKeys = [
    ["wines"],
    ["wine", vintage.wineId],
    ["vintages"],
    ["vintages", vintage.wineId],
    ["vintage", vintage.id],
  ];
  for (const queryKey of queryKeys) {
    queryClient.invalidateQueries({ queryKey, exact: true });
  }
}
