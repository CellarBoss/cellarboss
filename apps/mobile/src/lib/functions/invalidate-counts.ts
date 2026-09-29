import type { QueryClient } from "@tanstack/react-query";

// Wine and vintage responses embed tasting note and bottle counts, so any
// change to notes or bottles leaves those cached lists stale.
export function invalidateEmbeddedCounts(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["wines"] });
  queryClient.invalidateQueries({ queryKey: ["vintages"] });
}
