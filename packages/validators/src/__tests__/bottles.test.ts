import { describe, it, expect } from "vitest";
import { createBottleSchema, updateBottleSchema } from "../bottles.validator";

describe("createBottleSchema", () => {
  it("accepts a valid bottle", () => {
    const result = createBottleSchema.safeParse({
      purchaseDate: "2022-06-15",
      purchasePrice: 150.0,
      vintageId: 1,
      storageId: 2,
      status: "stored",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null storageId", () => {
    const result = createBottleSchema.safeParse({
      purchaseDate: "2022-06-15",
      purchasePrice: 0,
      vintageId: 1,
      storageId: null,
      status: "ordered",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all bottle statuses", () => {
    const statuses = [
      "ordered",
      "stored",
      "in-primeur",
      "drunk",
      "sold",
      "gifted",
    ] as const;
    for (const status of statuses) {
      const result = createBottleSchema.safeParse({
        purchaseDate: "2022-06-15",
        purchasePrice: 100,
        vintageId: 1,
        storageId: null,
        status,
      });
      expect(result.success, `status "${status}" should be valid`).toBe(true);
    }
  });

  it("rejects invalid date format", () => {
    const result = createBottleSchema.safeParse({
      purchaseDate: "15/06/2022",
      purchasePrice: 100,
      vintageId: 1,
      storageId: null,
      status: "stored",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative purchase price", () => {
    const result = createBottleSchema.safeParse({
      purchaseDate: "2022-06-15",
      purchasePrice: -10,
      vintageId: 1,
      storageId: null,
      status: "stored",
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero purchase price", () => {
    const result = createBottleSchema.safeParse({
      purchaseDate: "2022-06-15",
      purchasePrice: 0,
      vintageId: 1,
      storageId: null,
      status: "stored",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = createBottleSchema.safeParse({
      purchaseDate: "2022-06-15",
      purchasePrice: 100,
      vintageId: 1,
      storageId: null,
      status: "lost",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive vintageId", () => {
    const result = createBottleSchema.safeParse({
      purchaseDate: "2022-06-15",
      purchasePrice: 100,
      vintageId: 0,
      storageId: null,
      status: "stored",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateBottleSchema", () => {
  it("accepts a partial update with just status", () => {
    const result = updateBottleSchema.safeParse({ status: "drunk" });
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with just storageId", () => {
    const result = updateBottleSchema.safeParse({ storageId: 5 });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = updateBottleSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "At least one field must be provided",
      );
    }
  });
});
