import { describe, it, expect } from "vitest";
import { nextId } from "../ids";

describe("nextId", () => {
  it("returns 1 for an empty collection", () => {
    expect(nextId([])).toBe(1);
  });

  it("returns one more than the highest existing id", () => {
    expect(nextId([{ id: 3 }, { id: 7 }, { id: 5 }])).toBe(8);
  });

  it("ignores gaps left by deleted rows below the maximum", () => {
    expect(nextId([{ id: 1 }, { id: 4 }])).toBe(5);
  });
});
