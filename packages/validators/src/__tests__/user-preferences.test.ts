import { describe, it, expect } from "vitest";
import {
  upsertUserPreferenceSchema,
  userPreferenceKeySchema,
} from "../user-preferences.validator";

describe("userPreferenceKeySchema", () => {
  it("accepts namespaced keys", () => {
    const result = userPreferenceKeySchema.safeParse(
      "datatable.wines.columnVisibility",
    );
    expect(result.success).toBe(true);
  });

  it("rejects whitespace", () => {
    const result = userPreferenceKeySchema.safeParse("datatable wines");
    expect(result.success).toBe(false);
  });
});

describe("upsertUserPreferenceSchema", () => {
  it("accepts rich JSON values", () => {
    const result = upsertUserPreferenceSchema.safeParse({
      value: {
        visible: { name: true, region: false },
        pinned: ["name"],
        compact: false,
        empty: null,
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing values", () => {
    const result = upsertUserPreferenceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects non-JSON values", () => {
    const result = upsertUserPreferenceSchema.safeParse({
      value: { callback: () => true },
    });
    expect(result.success).toBe(false);
  });
});
