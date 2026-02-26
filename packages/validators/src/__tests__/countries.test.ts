import { describe, it, expect } from "vitest";
import {
  createCountrySchema,
  updateCountrySchema,
} from "../countries.validator";

describe("createCountrySchema", () => {
  it("accepts a valid country name", () => {
    const result = createCountrySchema.safeParse({ name: "France" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = createCountrySchema.safeParse({ name: "  France  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("France");
    }
  });

  it("rejects empty name", () => {
    const result = createCountrySchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const result = createCountrySchema.safeParse({ name: "A".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createCountrySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateCountrySchema", () => {
  it("accepts partial update with name", () => {
    const result = updateCountrySchema.safeParse({ name: "Germany" });
    expect(result.success).toBe(true);
  });

  it("rejects empty object", () => {
    const result = updateCountrySchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
