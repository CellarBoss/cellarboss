import { QueryClient } from "@tanstack/react-query";
import { invalidateVintageCounts } from "@/lib/functions/invalidate-vintage-counts";

describe("invalidateVintageCounts", () => {
  it("invalidates only vintage queries holding an affected vintage", () => {
    const queryClient = new QueryClient();
    const keys = [
      ["vintages"],
      ["vintages", "wine", 1],
      ["vintages", "wine", 2],
      ["vintages", 10],
      ["vintages", 20],
      ["bottles"],
    ];
    queryClient.setQueryData(["vintages"], [{ id: 10 }, { id: 20 }]);
    queryClient.setQueryData(["vintages", "wine", 1], [{ id: 10 }]);
    queryClient.setQueryData(["vintages", "wine", 2], [{ id: 20 }]);
    queryClient.setQueryData(["vintages", 10], { id: 10 });
    queryClient.setQueryData(["vintages", 20], { id: 20 });
    queryClient.setQueryData(["bottles"], [{ id: 10 }]);

    invalidateVintageCounts(queryClient, [10]);

    const stale = keys.filter(
      (key) => queryClient.getQueryState(key)?.isInvalidated,
    );
    expect(stale).toEqual([
      ["vintages"],
      ["vintages", "wine", 1],
      ["vintages", 10],
    ]);
  });
});
