import { describe, it, expect } from "vitest";
import {
  createStorageSchema,
  updateStorageSchema,
  storageFormValidators,
} from "../storages.validator";

describe("createStorageSchema", () => {
  it("accepts a valid storage with all fields", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      locationId: 1,
      parent: 2,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null locationId", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      locationId: null,
      parent: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts null parent", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      locationId: 1,
      parent: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts both nullable fields as null", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      locationId: null,
      parent: null,
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = createStorageSchema.safeParse({
      name: "  Shelf B  ",
      locationId: 1,
      parent: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Shelf B");
    }
  });

  it("rejects empty name", () => {
    const result = createStorageSchema.safeParse({
      name: "",
      locationId: 1,
      parent: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const result = createStorageSchema.safeParse({
      name: "A".repeat(256),
      locationId: 1,
      parent: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive locationId", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      locationId: 0,
      parent: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive parent", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      locationId: 1,
      parent: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing locationId", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      parent: null,
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing parent", () => {
    const result = createStorageSchema.safeParse({
      name: "Rack A",
      locationId: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateStorageSchema", () => {
  it("accepts partial update with name only", () => {
    const result = updateStorageSchema.safeParse({ name: "Shelf C" });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with locationId only", () => {
    const result = updateStorageSchema.safeParse({ locationId: 3 });
    expect(result.success).toBe(true);
  });

  it("accepts partial update with parent only", () => {
    const result = updateStorageSchema.safeParse({ parent: 5 });
    expect(result.success).toBe(true);
  });

  it("accepts setting locationId to null", () => {
    const result = updateStorageSchema.safeParse({ locationId: null });
    expect(result.success).toBe(true);
  });

  it("accepts setting parent to null", () => {
    const result = updateStorageSchema.safeParse({ parent: null });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateStorageSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("storageFormValidators", () => {
  it("coerces empty locationId to null", () => {
    const result = storageFormValidators.locationId.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBeNull();
  });

  it("coerces string locationId to number", () => {
    const result = storageFormValidators.locationId.safeParse("5");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(5);
  });

  it("coerces null/undefined locationId to null", () => {
    expect(storageFormValidators.locationId.safeParse(null).success).toBe(true);
    expect(storageFormValidators.locationId.safeParse(undefined).success).toBe(
      true,
    );
  });

  it("coerces empty parent to null", () => {
    const result = storageFormValidators.parent.safeParse("");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBeNull();
  });

  it("coerces string parent to number", () => {
    const result = storageFormValidators.parent.safeParse("3");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe(3);
  });

  it("validates name as non-empty trimmed string", () => {
    expect(storageFormValidators.name.safeParse("").success).toBe(false);
    const result = storageFormValidators.name.safeParse("  Rack B  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("Rack B");
  });
});
