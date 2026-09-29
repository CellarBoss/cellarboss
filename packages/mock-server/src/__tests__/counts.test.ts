import { beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import { createDefaultState, createMockApp, type MockState } from "../index";

describe("mock server embedded counts", () => {
  let state: MockState;
  let app: Hono;

  beforeEach(() => {
    state = createDefaultState();
    app = createMockApp(state);
  });

  it("matches wine tasting note counts to the notes across its vintages", async () => {
    const wines = await (await app.request("/api/wine")).json();
    for (const wine of wines) {
      const vintageIds = new Set(
        state.vintages.filter((v) => v.wineId === wine.id).map((v) => v.id),
      );
      const expected = state.tastingNotes.filter((n) =>
        vintageIds.has(n.vintageId),
      ).length;
      expect(wine.tastingNotesCount).toBe(expected);
    }
  });

  it("zero-fills bottle counts on every vintage", async () => {
    const vintages = await (await app.request("/api/vintage")).json();
    for (const vintage of vintages) {
      expect(Object.keys(vintage.bottles).sort()).toEqual([
        "drunk",
        "gifted",
        "in-primeur",
        "ordered",
        "sold",
        "stored",
      ]);
      const total = Object.values(
        vintage.bottles as Record<string, number>,
      ).reduce((a, b) => a + b, 0);
      expect(total).toBe(
        state.bottles.filter((b) => b.vintageId === vintage.id).length,
      );
    }
  });
});
