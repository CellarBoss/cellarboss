import { describe, it, expect } from "vitest";
import {
  getActiveFilters,
  isFilterValueActive,
  summarizeFilterValue,
} from "../activeFilters";
import { toggleFilterValue } from "../multiSelectFilterUtils";
import type {
  FlatMultiSelectFilterDef,
  GroupedMultiSelectFilterDef,
} from "../multiSelectFilterUtils";
import type { RangeFilterDef } from "../RangeFilter";

const typeFilter: FlatMultiSelectFilterDef = {
  type: "multiselect",
  columnId: "type",
  label: "Type",
  options: [
    { value: "red", label: "Red" },
    { value: "white", label: "White" },
    { value: "rose", label: "Rosé" },
  ],
};

const storageFilter: GroupedMultiSelectFilterDef = {
  type: "grouped-multiselect",
  columnId: "storageId",
  label: "Storage",
  options: [
    { group: "Room A", options: [{ value: "1", label: "Rack 1" }] },
    { group: "Room B", options: [{ value: "2", label: "Wine Fridge" }] },
  ],
};

const priceFilter: RangeFilterDef = {
  type: "range",
  columnId: "purchasePrice",
  label: "Price",
};

describe("isFilterValueActive", () => {
  it("treats an empty or missing selection as inactive", () => {
    expect(isFilterValueActive(typeFilter, undefined)).toBe(false);
    expect(isFilterValueActive(typeFilter, [])).toBe(false);
    expect(isFilterValueActive(typeFilter, ["red"])).toBe(true);
  });

  it("treats a range with either bound as active", () => {
    expect(isFilterValueActive(priceFilter, undefined)).toBe(false);
    expect(isFilterValueActive(priceFilter, {})).toBe(false);
    expect(isFilterValueActive(priceFilter, { min: 0 })).toBe(true);
    expect(isFilterValueActive(priceFilter, { max: 50 })).toBe(true);
  });
});

describe("summarizeFilterValue", () => {
  it("lists option labels for a short selection", () => {
    expect(summarizeFilterValue(typeFilter, ["red", "rose"])).toBe("Red, Rosé");
  });

  it("counts a longer selection", () => {
    expect(summarizeFilterValue(typeFilter, ["red", "white", "rose"])).toBe(
      "3 selected",
    );
  });

  it("looks up labels inside option groups", () => {
    expect(summarizeFilterValue(storageFilter, ["2"])).toBe("Wine Fridge");
  });

  it("falls back to the raw value for an unknown option", () => {
    expect(summarizeFilterValue(typeFilter, ["orange"])).toBe("orange");
  });

  it("describes open and closed ranges", () => {
    expect(summarizeFilterValue(priceFilter, { min: 10, max: 50 })).toBe(
      "10 – 50",
    );
    expect(summarizeFilterValue(priceFilter, { min: 10 })).toBe("≥ 10");
    expect(summarizeFilterValue(priceFilter, { max: 50 })).toBe("≤ 50");
  });
});

describe("getActiveFilters", () => {
  it("returns only filters with a value, in definition order", () => {
    const active = getActiveFilters(
      [typeFilter, storageFilter, priceFilter],
      [
        { id: "purchasePrice", value: { max: 100 } },
        { id: "storageId", value: [] },
        { id: "type", value: ["white"] },
      ],
    );
    expect(active).toEqual([
      { filter: typeFilter, summary: "White" },
      { filter: priceFilter, summary: "≤ 100" },
    ]);
  });
});

describe("toggleFilterValue", () => {
  it("adds a value once", () => {
    expect(toggleFilterValue(undefined, "red", true)).toEqual(["red"]);
    expect(toggleFilterValue(["red"], "red", true)).toEqual(["red"]);
  });

  it("removes a value and clears an empty selection", () => {
    expect(toggleFilterValue(["red", "white"], "red", false)).toEqual([
      "white",
    ]);
    expect(toggleFilterValue(["red"], "red", false)).toBeUndefined();
  });
});
