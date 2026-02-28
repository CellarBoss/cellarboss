import { describe, it, expect } from "vitest";
import {
  createWineGrapeSchema,
  updateWineGrapeSchema,
} from "../winegrapes.validator";

describe("createWineGrapeSchema", () => {
  it("accepts valid wineId and grapeId", () => {
    const result = createWineGrapeSchema.safeParse({
      wineId: 1,
      grapeId: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-positive wineId", () => {
    const result = createWineGrapeSchema.safeParse({
      wineId: 0,
      grapeId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative wineId", () => {
    const result = createWineGrapeSchema.safeParse({
      wineId: -1,
      grapeId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive grapeId", () => {
    const result = createWineGrapeSchema.safeParse({
      wineId: 1,
      grapeId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing wineId", () => {
    const result = createWineGrapeSchema.safeParse({ grapeId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects missing grapeId", () => {
    const result = createWineGrapeSchema.safeParse({ wineId: 1 });
    expect(result.success).toBe(false);
  });
});

describe("updateWineGrapeSchema", () => {
  it("accepts partial update with wineId only", () => {
    const result = updateWineGrapeSchema.safeParse({ wineId: 3 });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with grapeId only", () => {
    const result = updateWineGrapeSchema.safeParse({ grapeId: 4 });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateWineGrapeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
