import { describe, it, expect } from "vitest";
import {
  createVintageSchema,
  updateVintageSchema,
} from "../vintages.validator";

describe("createVintageSchema", () => {
  it("accepts a valid vintage", () => {
    const result = createVintageSchema.safeParse({
      year: 2015,
      wineId: 1,
      drinkFrom: 2022,
      drinkUntil: 2035,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null year (non-vintage)", () => {
    const result = createVintageSchema.safeParse({
      year: null,
      wineId: 1,
      drinkFrom: null,
      drinkUntil: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null drinkFrom and drinkUntil", () => {
    const result = createVintageSchema.safeParse({
      year: 2020,
      wineId: 1,
      drinkFrom: null,
      drinkUntil: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects year below 1800", () => {
    const result = createVintageSchema.safeParse({
      year: 1799,
      wineId: 1,
      drinkFrom: null,
      drinkUntil: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects year above 2100", () => {
    const result = createVintageSchema.safeParse({
      year: 2101,
      wineId: 1,
      drinkFrom: null,
      drinkUntil: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive wineId", () => {
    const result = createVintageSchema.safeParse({
      year: 2020,
      wineId: 0,
      drinkFrom: null,
      drinkUntil: null,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateVintageSchema", () => {
  it("accepts a partial update with just year", () => {
    const result = updateVintageSchema.safeParse({ year: 2016 });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = updateVintageSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
