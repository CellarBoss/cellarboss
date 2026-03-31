import { describe, it, expect } from "vitest";
import {
  createVintageSchema,
  updateVintageSchema,
  vintageFormValidators,
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

describe("vintageFormValidators", () => {
  it("coerces string wineId to number", () => {
    const result = vintageFormValidators.wineId.safeParse("5");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(5);
  });

  it("rejects non-numeric wineId", () => {
    expect(vintageFormValidators.wineId.safeParse("abc").success).toBe(false);
  });

  it("coerces empty year to null", () => {
    const result = vintageFormValidators.year.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBeNull();
  });

  it("coerces string year to number", () => {
    const result = vintageFormValidators.year.safeParse("2020");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(2020);
  });

  it("rejects year out of range", () => {
    expect(vintageFormValidators.year.safeParse("1799").success).toBe(false);
    expect(vintageFormValidators.year.safeParse("2101").success).toBe(false);
  });

  it("coerces empty drinkFrom/drinkUntil to null", () => {
    expect(vintageFormValidators.drinkFrom.safeParse("").success).toBe(true);
    expect(vintageFormValidators.drinkUntil.safeParse("").success).toBe(true);
  });

  it("coerces string drinkFrom to number", () => {
    const result = vintageFormValidators.drinkFrom.safeParse("2025");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(2025);
  });

  it("rejects drinkUntil out of range", () => {
    expect(vintageFormValidators.drinkUntil.safeParse("2201").success).toBe(
      false,
    );
  });
});
