import { describe, it, expect } from "vitest";
import { normaliseTableId, tablePreferenceKey } from "../tablePreferences";

// Mirrors the backend preference-key validator.
const KEY_SEGMENT = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/;

describe("normaliseTableId", () => {
  it("strips slashes and lowercases", () => {
    expect(normaliseTableId("/Bottles")).toBe("bottles");
  });

  it("turns nested paths into dotted levels", () => {
    expect(normaliseTableId("/wines/red")).toBe("wines.red");
  });

  it("strips punctuation within a level instead of adding a level", () => {
    expect(normaliseTableId("/tasting-notes")).toBe("tastingnotes");
  });

  it("treats dots as level separators", () => {
    expect(normaliseTableId("bottles.archived")).toBe("bottles.archived");
  });

  it("prefixes levels that start with a digit", () => {
    expect(normaliseTableId("/wines/2020")).toBe("wines.t2020");
  });

  it("falls back to 'root' for empty input", () => {
    expect(normaliseTableId("/")).toBe("root");
    expect(normaliseTableId("")).toBe("root");
  });
});

describe("tablePreferenceKey", () => {
  it("groups parts under the table namespace", () => {
    expect(tablePreferenceKey("bottles", "columns", "visibility")).toBe(
      "datatable.bottles.columns.visibility",
    );
    expect(tablePreferenceKey("bottles", "columns", "order")).toBe(
      "datatable.bottles.columns.order",
    );
  });

  it("always produces a backend-valid key for normalised ids", () => {
    for (const raw of [
      "/Bottles",
      "/wines/red",
      "/tasting-notes",
      "/wines/2020",
      "/",
      "/a//b/",
      "/Foo_Bar 99",
    ]) {
      const key = tablePreferenceKey(
        normaliseTableId(raw),
        "columns",
        "visibility",
      );
      expect(key).toMatch(KEY_SEGMENT);
    }
  });
});
