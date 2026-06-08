import { describe, it, expect } from "vitest";
import {
  preferenceKeySchema,
  upsertPreferenceSchema,
} from "../preferences.validator";

describe("preferenceKeySchema", () => {
  it("accepts a simple lowercase key", () => {
    expect(preferenceKeySchema.safeParse("columns").success).toBe(true);
  });

  it("accepts a dotted namespace key", () => {
    expect(preferenceKeySchema.safeParse("columns.bottles").success).toBe(true);
  });

  it("accepts multiple dots", () => {
    expect(preferenceKeySchema.safeParse("ui.table.bottles").success).toBe(
      true,
    );
  });

  it("accepts keys with digits after the first character", () => {
    expect(preferenceKeySchema.safeParse("col1.bottles2").success).toBe(true);
  });

  it("rejects uppercase letters", () => {
    expect(preferenceKeySchema.safeParse("Columns").success).toBe(false);
    expect(preferenceKeySchema.safeParse("columns.Bottles").success).toBe(
      false,
    );
  });

  it("rejects keys starting with a digit", () => {
    expect(preferenceKeySchema.safeParse("1columns").success).toBe(false);
  });

  it("rejects keys starting with a dot", () => {
    expect(preferenceKeySchema.safeParse(".columns").success).toBe(false);
  });

  it("rejects keys ending with a dot", () => {
    expect(preferenceKeySchema.safeParse("columns.").success).toBe(false);
  });

  it("rejects consecutive dots", () => {
    expect(preferenceKeySchema.safeParse("columns..bottles").success).toBe(
      false,
    );
  });

  it("rejects keys with spaces", () => {
    expect(preferenceKeySchema.safeParse("col umns").success).toBe(false);
  });

  it("rejects keys with hyphens", () => {
    expect(preferenceKeySchema.safeParse("col-umns").success).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(preferenceKeySchema.safeParse("").success).toBe(false);
  });
});

describe("upsertPreferenceSchema", () => {
  it("accepts a JSON string value", () => {
    const result = upsertPreferenceSchema.safeParse({
      value: JSON.stringify({ visible: true }),
    });
    expect(result.success).toBe(true);
  });

  it("accepts a plain string value", () => {
    expect(upsertPreferenceSchema.safeParse({ value: "dark" }).success).toBe(
      true,
    );
  });

  it("accepts an empty string", () => {
    expect(upsertPreferenceSchema.safeParse({ value: "" }).success).toBe(true);
  });

  it("trims whitespace", () => {
    const result = upsertPreferenceSchema.safeParse({ value: "  dark  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.value).toBe("dark");
  });

  it("rejects a value exceeding 100000 characters", () => {
    expect(
      upsertPreferenceSchema.safeParse({ value: "x".repeat(100001) }).success,
    ).toBe(false);
  });

  it("rejects missing value", () => {
    expect(upsertPreferenceSchema.safeParse({}).success).toBe(false);
  });
});
