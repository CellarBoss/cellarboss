import { describe, it, expect } from "vitest";
import { buildTree, buildHierarchicalOptions, sortHierarchicalOptions } from "../tree";

describe("buildTree", () => {
  it("builds a simple flat list with no parent", () => {
    const items = [
      { id: 1, name: "A", parent: null },
      { id: 2, name: "B", parent: null },
    ];
    const tree = buildTree(items, "parent");
    expect(tree).toHaveLength(2);
    expect(tree[0].subRows).toHaveLength(0);
  });

  it("nests children under parents", () => {
    const items = [
      { id: 1, name: "Root", parent: null },
      { id: 2, name: "Child A", parent: 1 },
      { id: 3, name: "Child B", parent: 1 },
    ];
    const tree = buildTree(items, "parent");
    expect(tree).toHaveLength(1);
    expect(tree[0].subRows).toHaveLength(2);
  });

  it("handles deep nesting", () => {
    const items = [
      { id: 1, name: "Root", parent: null },
      { id: 2, name: "Level 1", parent: 1 },
      { id: 3, name: "Level 2", parent: 2 },
    ];
    const tree = buildTree(items, "parent");
    expect(tree).toHaveLength(1);
    expect(tree[0].subRows[0].subRows).toHaveLength(1);
    expect(tree[0].subRows[0].subRows[0].name).toBe("Level 2");
  });

  it("handles empty input", () => {
    expect(buildTree([], "parent")).toEqual([]);
  });

  it("ignores orphaned children (parent ID not found)", () => {
    const items = [
      { id: 1, name: "Root", parent: null },
      { id: 2, name: "Orphan", parent: 999 },
    ];
    const tree = buildTree(items, "parent");
    // Orphan becomes a root node since its parent doesn't exist
    expect(tree).toHaveLength(2);
  });
});

describe("buildHierarchicalOptions", () => {
  it("converts flat tree to options", () => {
    const items = [
      { id: 1, name: "A", parent: null, subRows: [] },
      { id: 2, name: "B", parent: null, subRows: [] },
    ];
    const options = buildHierarchicalOptions(items as any);
    expect(options).toHaveLength(2);
    expect(options[0]).toEqual({ value: "1", label: "A" });
    expect(options[1]).toEqual({ value: "2", label: "B" });
  });

  it("indents children", () => {
    const tree = buildTree(
      [
        { id: 1, name: "Root", parent: null },
        { id: 2, name: "Child", parent: 1 },
      ],
      "parent",
    );
    const options = buildHierarchicalOptions(tree as any);
    expect(options).toHaveLength(2);
    expect(options[0].label).toBe("Root");
    // Child should have indentation prefix
    expect(options[1].label).not.toBe("Child");
    expect(options[1].label).toContain("Child");
  });
});

describe("sortHierarchicalOptions", () => {
  it("sorts root items alphabetically", () => {
    const options = [
      { value: "2", label: "B" },
      { value: "1", label: "A" },
      { value: "3", label: "C" },
    ];
    const sorted = sortHierarchicalOptions(options);
    expect(sorted.map((o) => o.label)).toEqual(["A", "B", "C"]);
  });

  it("preserves order of already-sorted options", () => {
    const options = [
      { value: "1", label: "Alpha" },
      { value: "2", label: "Beta" },
      { value: "3", label: "Gamma" },
    ];
    const sorted = sortHierarchicalOptions(options);
    expect(sorted.map((o) => o.label)).toEqual(["Alpha", "Beta", "Gamma"]);
  });
});
