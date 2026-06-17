import { describe, it, expect } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import {
  columnPreferenceKey,
  computeDefaultColumnVisibility,
  getHideableColumnIds,
  mergeSavedVisibility,
  parseSavedVisibility,
  serializeColumnVisibility,
} from "../columnVisibility";

type Row = { id: number };

const columns: ColumnDef<Row>[] = [
  { id: "name", header: "Name", meta: { isHideable: false } },
  { id: "price", header: "Price" },
  { id: "size", header: "Size", meta: { defaultVisible: false } },
  { id: "region", header: "Region" },
  { id: "wineId", header: "", meta: { isSuppressed: true } },
];

describe("columnPreferenceKey", () => {
  it("groups the key per table", () => {
    expect(columnPreferenceKey("bottles")).toBe(
      "datatable.bottles.columns.visibility",
    );
  });
});

describe("computeDefaultColumnVisibility", () => {
  it("hides suppressed and defaultVisible:false columns", () => {
    expect(computeDefaultColumnVisibility(columns)).toEqual({
      size: false,
      wineId: false,
    });
  });

  it("leaves visible-by-default columns absent", () => {
    const result = computeDefaultColumnVisibility(columns);
    expect(result).not.toHaveProperty("name");
    expect(result).not.toHaveProperty("price");
  });
});

describe("getHideableColumnIds", () => {
  it("excludes suppressed and non-hideable columns", () => {
    expect(getHideableColumnIds(columns)).toEqual(
      new Set(["price", "size", "region"]),
    );
  });
});

describe("parseSavedVisibility", () => {
  it("returns null for empty or malformed input", () => {
    expect(parseSavedVisibility(undefined)).toBeNull();
    expect(parseSavedVisibility("not json")).toBeNull();
    expect(parseSavedVisibility("[1,2,3]")).toBeNull();
    expect(parseSavedVisibility("42")).toBeNull();
  });

  it("keeps only boolean entries", () => {
    expect(
      parseSavedVisibility('{"price":false,"size":true,"bogus":"x"}'),
    ).toEqual({ price: false, size: true });
  });
});

describe("mergeSavedVisibility", () => {
  const hideable = getHideableColumnIds(columns);
  const defaults = computeDefaultColumnVisibility(columns);

  it("returns defaults when nothing is saved", () => {
    expect(mergeSavedVisibility(defaults, null, hideable)).toBe(defaults);
  });

  it("overlays saved values for hideable columns", () => {
    const merged = mergeSavedVisibility(
      defaults,
      { price: false, size: true },
      hideable,
    );
    expect(merged.price).toBe(false);
    expect(merged.size).toBe(true);
  });

  it("ignores saved values for suppressed or non-hideable columns", () => {
    const merged = mergeSavedVisibility(
      defaults,
      { wineId: true, name: false },
      hideable,
    );
    expect(merged.wineId).toBe(false); // suppressed stays hidden
    expect(merged).not.toHaveProperty("name"); // non-hideable untouched
  });
});

describe("serializeColumnVisibility", () => {
  const hideable = getHideableColumnIds(columns);

  it("stores explicit booleans for every hideable column only", () => {
    const json = serializeColumnVisibility({ size: false }, hideable);
    expect(JSON.parse(json)).toEqual({
      price: true,
      size: false,
      region: true,
    });
  });

  it("round-trips through parseSavedVisibility", () => {
    const json = serializeColumnVisibility({ price: false }, hideable);
    expect(parseSavedVisibility(json)).toEqual({
      price: false,
      size: true,
      region: true,
    });
  });
});
