import { describe, it, expect } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { invalidateVintageCounts } from "../invalidate-vintage-counts";

const KEYS = [
  ["wines"],
  ["wine", 1],
  ["wine", 2],
  ["vintages"],
  ["vintages", 1],
  ["vintages", 2],
  ["vintage", 10],
  ["vintage", 20],
  ["bottles"],
  ["winemakers"],
];

describe("invalidateVintageCounts", () => {
  it("invalidates only entries carrying counts for the given vintage", () => {
    const queryClient = new QueryClient();
    for (const key of KEYS) queryClient.setQueryData(key, []);

    invalidateVintageCounts(queryClient, { id: 10, wineId: 1 });

    const stale = KEYS.filter(
      (key) => queryClient.getQueryState(key)?.isInvalidated,
    );
    expect(stale).toEqual([
      ["wines"],
      ["wine", 1],
      ["vintages"],
      ["vintages", 1],
      ["vintage", 10],
    ]);
  });
});
