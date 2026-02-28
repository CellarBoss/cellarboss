import { describe, it, expect } from "vitest";
import { createGrapeSchema, updateGrapeSchema } from "../grapes.validator";

describe("createGrapeSchema", () => {
  it("accepts a valid grape name", () => {
    const result = createGrapeSchema.safeParse({ name: "Pinot Noir" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = createGrapeSchema.safeParse({ name: "  Chardonnay  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Chardonnay");
    }
  });

  it("rejects empty name", () => {
    const result = createGrapeSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const result = createGrapeSchema.safeParse({ name: "A".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createGrapeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateGrapeSchema", () => {
  it("accepts partial update with name", () => {
    const result = updateGrapeSchema.safeParse({ name: "Merlot" });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateGrapeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
