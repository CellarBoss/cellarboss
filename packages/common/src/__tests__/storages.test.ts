import { describe, it, expect } from "vitest";
import { buildDescendantsMap, getStorageAncestry } from "../storages";
import type { Storage } from "@cellarboss/types";

const storages: Storage[] = [
  { id: 1, name: "Room", parent: null, locationId: 1 },
  { id: 2, name: "Fridge", parent: 1, locationId: 1 },
  { id: 3, name: "Rack", parent: 1, locationId: 1 },
  { id: 4, name: "Shelf", parent: 2, locationId: 1 },
  { id: 5, name: "Box", parent: 4, locationId: 1 },
];
const storageMap = new Map(storages.map((s) => [s.id, s]));

describe("buildDescendantsMap", () => {
  it("includes self in descendants set", () => {
    const map = buildDescendantsMap(storages);
    expect(map.get(1)?.has(1)).toBe(true);
  });

  it("root includes descendants at every depth", () => {
    const map = buildDescendantsMap(storages);
    expect([...map.get(1)!].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("intermediate node includes only its own subtree", () => {
    const map = buildDescendantsMap(storages);
    expect([...map.get(2)!].sort()).toEqual([2, 4, 5]);
  });

  it("leaf node only contains itself", () => {
    const map = buildDescendantsMap(storages);
    expect([...map.get(3)!]).toEqual([3]);
  });

  it("handles empty storage list", () => {
    expect(buildDescendantsMap([]).size).toBe(0);
  });

  it("does not loop forever on circular parents", () => {
    const circular: Storage[] = [
      { id: 1, name: "A", parent: 2, locationId: 1 },
      { id: 2, name: "B", parent: 1, locationId: 1 },
    ];
    const map = buildDescendantsMap(circular);
    expect(map.get(1)?.has(2)).toBe(true);
    expect(map.get(2)?.has(1)).toBe(true);
  });

  it("gives every storage in a cycle the cycle's full subtree", () => {
    const circular: Storage[] = [
      { id: 1, name: "A", parent: 2, locationId: 1 },
      { id: 2, name: "B", parent: 1, locationId: 1 },
      { id: 3, name: "C", parent: 1, locationId: 1 },
    ];
    const map = buildDescendantsMap(circular);
    expect([...map.get(1)!].sort()).toEqual([1, 2, 3]);
    expect([...map.get(2)!].sort()).toEqual([1, 2, 3]);
    expect([...map.get(3)!]).toEqual([3]);
  });
});

describe("getStorageAncestry", () => {
  const names = (path: Storage[]) => path.map((s) => s.name);

  it("returns the full path from the top-level storage", () => {
    expect(names(getStorageAncestry(5, storageMap))).toEqual([
      "Room",
      "Fridge",
      "Shelf",
      "Box",
    ]);
  });

  it("returns a single entry for a top-level storage", () => {
    expect(names(getStorageAncestry(1, storageMap))).toEqual(["Room"]);
  });

  it("returns an empty path for null or unknown storages", () => {
    expect(getStorageAncestry(null, storageMap)).toEqual([]);
    expect(getStorageAncestry(undefined, storageMap)).toEqual([]);
    expect(getStorageAncestry(999, storageMap)).toEqual([]);
  });

  it("returns a path relative to an ancestor", () => {
    expect(names(getStorageAncestry(5, storageMap, 2))).toEqual([
      "Shelf",
      "Box",
    ]);
  });

  it("returns an empty path when relative to itself", () => {
    expect(getStorageAncestry(2, storageMap, 2)).toEqual([]);
  });

  it("stops at a missing parent", () => {
    const orphan = new Map(storageMap);
    orphan.set(6, { id: 6, name: "Orphan", parent: 99, locationId: 1 });
    expect(names(getStorageAncestry(6, orphan))).toEqual(["Orphan"]);
  });

  it("does not loop forever on circular parents", () => {
    const circular = new Map<number, Storage>([
      [1, { id: 1, name: "A", parent: 2, locationId: 1 }],
      [2, { id: 2, name: "B", parent: 1, locationId: 1 }],
    ]);
    expect(names(getStorageAncestry(1, circular))).toEqual(["B", "A"]);
  });
});
