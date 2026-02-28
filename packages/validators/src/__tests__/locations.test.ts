import { describe, it, expect } from "vitest";
import {
  createLocationSchema,
  updateLocationSchema,
} from "../locations.validator";

describe("createLocationSchema", () => {
  it("accepts a valid location name", () => {
    const result = createLocationSchema.safeParse({ name: "Wine Cellar" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = createLocationSchema.safeParse({ name: "  Garage  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Garage");
    }
  });

  it("rejects empty name", () => {
    const result = createLocationSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const result = createLocationSchema.safeParse({ name: "A".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createLocationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateLocationSchema", () => {
  it("accepts partial update with name", () => {
    const result = updateLocationSchema.safeParse({ name: "Basement" });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateLocationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
