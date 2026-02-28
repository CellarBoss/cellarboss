import { describe, it, expect } from "vitest";
import {
  createWineMakerSchema,
  updateWineMakerSchema,
} from "../winemakers.validator";

describe("createWineMakerSchema", () => {
  it("accepts a valid winemaker name", () => {
    const result = createWineMakerSchema.safeParse({
      name: "Domaine de la Romanée-Conti",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = createWineMakerSchema.safeParse({
      name: "  Château Margaux  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Château Margaux");
    }
  });

  it("rejects empty name", () => {
    const result = createWineMakerSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const result = createWineMakerSchema.safeParse({ name: "A".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createWineMakerSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateWineMakerSchema", () => {
  it("accepts partial update with name", () => {
    const result = updateWineMakerSchema.safeParse({ name: "Penfolds" });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateWineMakerSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
