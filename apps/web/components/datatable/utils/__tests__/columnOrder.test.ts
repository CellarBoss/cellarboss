import { describe, it, expect } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import {
  columnMenuLabel,
  columnOrderPreferenceKey,
  getOrderableColumnIds,
  mergeSavedOrder,
  parseSavedOrder,
  serializeColumnOrder,
} from "../columnOrder";

type Row = { id: number };

const columns: ColumnDef<Row>[] = [
  { id: "name", header: "Name", meta: { isHideable: false } },
  { id: "price", header: "Price" },
  { id: "size", header: "Size", meta: { defaultVisible: false } },
  { id: "region", header: "Region", meta: { label: "Region" } },
  { id: "wineId", header: "", meta: { isSuppressed: true } },
  { id: "actions", header: "" },
];

describe("columnOrderPreferenceKey", () => {
  it("groups the key per table", () => {
    expect(columnOrderPreferenceKey("bottles")).toBe(
      "datatable.bottles.columns.order",
    );
  });
});

describe("columnMenuLabel", () => {
  it("uses an explicit label, then a string header", () => {
    expect(columnMenuLabel(columns[3])).toBe("Region");
    expect(columnMenuLabel(columns[0])).toBe("Name");
  });

  it("returns null for suppressed or label-less columns", () => {
    expect(columnMenuLabel(columns[4])).toBeNull(); // suppressed
    expect(columnMenuLabel(columns[5])).toBeNull(); // empty header, no label
  });
});

describe("getOrderableColumnIds", () => {
  it("lists menu columns in definition order, excluding suppressed/label-less", () => {
    expect(getOrderableColumnIds(columns)).toEqual([
      "name",
      "price",
      "size",
      "region",
    ]);
  });
});

describe("parseSavedOrder", () => {
  it("returns null for empty or malformed input", () => {
    expect(parseSavedOrder(undefined)).toBeNull();
    expect(parseSavedOrder("not json")).toBeNull();
    expect(parseSavedOrder('{"a":1}')).toBeNull();
  });

  it("keeps only string entries", () => {
    expect(parseSavedOrder('["price","name",3,null]')).toEqual([
      "price",
      "name",
    ]);
  });
});

describe("mergeSavedOrder", () => {
  const orderable = getOrderableColumnIds(columns);

  it("returns the default order when nothing is saved", () => {
    expect(mergeSavedOrder(orderable, null)).toBe(orderable);
  });

  it("applies a saved order", () => {
    expect(
      mergeSavedOrder(orderable, ["region", "name", "price", "size"]),
    ).toEqual(["region", "name", "price", "size"]);
  });

  it("drops stale and duplicate saved ids", () => {
    expect(
      mergeSavedOrder(orderable, ["region", "gone", "region", "name"]),
    ).toEqual(["region", "name", "price", "size"]);
  });

  it("appends new orderable columns missing from the saved order", () => {
    expect(mergeSavedOrder(orderable, ["region", "name"])).toEqual([
      "region",
      "name",
      "price",
      "size",
    ]);
  });
});

describe("serializeColumnOrder", () => {
  it("round-trips through parseSavedOrder", () => {
    const json = serializeColumnOrder(["region", "name", "price"]);
    expect(parseSavedOrder(json)).toEqual(["region", "name", "price"]);
  });
});
