import { describe, it, expect } from "vitest";
import { updateSettingSchema } from "../settings.validator";

describe("updateSettingSchema", () => {
  it("accepts a valid string value", () => {
    const result = updateSettingSchema.safeParse({ value: "dark" });
    expect(result.success).toBe(true);
  });

  it("accepts an empty string value", () => {
    const result = updateSettingSchema.safeParse({ value: "" });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from value", () => {
    const result = updateSettingSchema.safeParse({ value: "  trimmed  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.value).toBe("trimmed");
    }
  });

  it("rejects value exceeding 10000 characters", () => {
    const result = updateSettingSchema.safeParse({
      value: "A".repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts value at exactly 10000 characters", () => {
    const result = updateSettingSchema.safeParse({
      value: "A".repeat(10000),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing value", () => {
    const result = updateSettingSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
