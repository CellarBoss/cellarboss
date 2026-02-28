import { describe, it, expect } from "vitest";
import {
  createRegionSchema,
  updateRegionSchema,
} from "../regions.validator";

describe("createRegionSchema", () => {
  it("accepts a valid region", () => {
    const result = createRegionSchema.safeParse({
      name: "Burgundy",
      countryId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = createRegionSchema.safeParse({
      name: "  Bordeaux  ",
      countryId: 1,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Bordeaux");
    }
  });

  it("coerces string countryId to number", () => {
    const result = createRegionSchema.safeParse({
      name: "Champagne",
      countryId: "3",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.countryId).toBe(3);
    }
  });

  it("rejects empty name", () => {
    const result = createRegionSchema.safeParse({ name: "", countryId: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const result = createRegionSchema.safeParse({
      name: "A".repeat(256),
      countryId: 1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive countryId", () => {
    const result = createRegionSchema.safeParse({
      name: "Burgundy",
      countryId: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative countryId", () => {
    const result = createRegionSchema.safeParse({
      name: "Burgundy",
      countryId: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing countryId", () => {
    const result = createRegionSchema.safeParse({ name: "Burgundy" });
    expect(result.success).toBe(false);
  });
});

describe("updateRegionSchema", () => {
  it("accepts partial update with name only", () => {
    const result = updateRegionSchema.safeParse({ name: "Rhône Valley" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with countryId only", () => {
    const result = updateRegionSchema.safeParse({ countryId: 2 });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateRegionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
