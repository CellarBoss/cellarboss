import { describe, it, expect } from "vitest";
import type { Row } from "@tanstack/react-table";
import type { AppFeatures } from "../../tableFeatures";
import { multiSelectFilter } from "../multiSelectFilter";
import { rangeFilter } from "../rangeFilter";

type TestRow = { status: string; year: number };

function makeRow(values: TestRow): Row<AppFeatures, TestRow> {
  return {
    getValue: (columnId: keyof TestRow) => values[columnId],
  } as unknown as Row<AppFeatures, TestRow>;
}

describe("multiSelectFilter", () => {
  const filter = multiSelectFilter<TestRow>();
  const row = makeRow({ status: "stored", year: 2015 });

  it("passes every row when nothing is selected", () => {
    expect(filter(row, "status", [], () => {})).toBe(true);
  });

  it("passes rows whose value is selected", () => {
    expect(filter(row, "status", ["drunk", "stored"], () => {})).toBe(true);
  });

  it("rejects rows whose value is not selected", () => {
    expect(filter(row, "status", ["drunk"], () => {})).toBe(false);
  });

  it("compares non-string values by their string form", () => {
    expect(filter(row, "year", ["2015"], () => {})).toBe(true);
  });

  it("is removed when the selection is empty", () => {
    expect(filter.autoRemove?.([])).toBe(true);
    expect(filter.autoRemove?.(["stored"])).toBe(false);
  });
});

describe("rangeFilter", () => {
  const filter = rangeFilter<TestRow>();
  const row = makeRow({ status: "stored", year: 2015 });

  it("passes every row when no bounds are set", () => {
    expect(filter(row, "year", {}, () => {})).toBe(true);
  });

  it("passes rows within the bounds, inclusive", () => {
    expect(filter(row, "year", { min: 2015, max: 2015 }, () => {})).toBe(true);
    expect(filter(row, "year", { min: 2010, max: 2020 }, () => {})).toBe(true);
  });

  it("rejects rows below the minimum", () => {
    expect(filter(row, "year", { min: 2016 }, () => {})).toBe(false);
  });

  it("rejects rows above the maximum", () => {
    expect(filter(row, "year", { max: 2014 }, () => {})).toBe(false);
  });

  it("is removed when neither bound is set", () => {
    expect(filter.autoRemove?.({})).toBe(true);
    expect(filter.autoRemove?.({ min: 2010 })).toBe(false);
  });
});
