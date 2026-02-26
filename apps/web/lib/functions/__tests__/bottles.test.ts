import { describe, it, expect } from "vitest";
import {
  getVintageName,
  buildDescendantsMap,
  buildWineGroupedOptions,
} from "../bottles";
import type { Vintage, Wine, WineMaker, Storage } from "@cellarboss/types";

describe("getVintageName", () => {
  const vintageMap = new Map<number, Vintage>([
    [
      1,
      {
        id: 1,
        wineId: 10,
        year: 2015,
        drinkFrom: null,
        drinkUntil: null,
      },
    ],
  ]);

  const wineMap = new Map<number, Wine>([
    [10, { id: 10, name: "Château Margaux", wineMakerId: 100, regionId: 1, type: "red" }],
  ]);

  const winemakerMap = new Map<number, WineMaker>([
    [100, { id: 100, name: "Domaine Test" }],
  ]);

  it("returns formatted vintage name with winemaker", () => {
    const name = getVintageName(1, vintageMap, wineMap, winemakerMap);
    expect(name).toBe("Domaine Test - Château Margaux 2015");
  });

  it("returns name without winemaker when winemaker not found", () => {
    const emptyWinemakerMap = new Map<number, WineMaker>();
    const name = getVintageName(1, vintageMap, wineMap, emptyWinemakerMap);
    expect(name).toBe("Château Margaux 2015");
  });

  it("returns 'Unknown' when vintage not found", () => {
    const name = getVintageName(999, vintageMap, wineMap, winemakerMap);
    expect(name).toBe("Unknown");
  });

  it("returns wine name with NV when year is null", () => {
    const nvVintageMap = new Map<number, Vintage>([
      [2, { id: 2, wineId: 10, year: null, drinkFrom: null, drinkUntil: null }],
    ]);
    const name = getVintageName(2, nvVintageMap, wineMap, winemakerMap);
    expect(name).toBe("Domaine Test - Château Margaux NV");
  });
});

describe("buildDescendantsMap", () => {
  const storages: Storage[] = [
    { id: 1, name: "Root", parent: null, locationId: 1 },
    { id: 2, name: "Child A", parent: 1, locationId: 1 },
    { id: 3, name: "Child B", parent: 1, locationId: 1 },
    { id: 4, name: "Grandchild", parent: 2, locationId: 1 },
  ];

  it("includes self in descendants set", () => {
    const map = buildDescendantsMap(storages);
    expect(map.get(1)?.has(1)).toBe(true);
  });

  it("root includes all descendants", () => {
    const map = buildDescendantsMap(storages);
    const rootDescendants = map.get(1)!;
    expect(rootDescendants.has(1)).toBe(true);
    expect(rootDescendants.has(2)).toBe(true);
    expect(rootDescendants.has(3)).toBe(true);
    expect(rootDescendants.has(4)).toBe(true);
  });

  it("leaf node only contains itself", () => {
    const map = buildDescendantsMap(storages);
    const leafDescendants = map.get(3)!;
    expect(leafDescendants.size).toBe(1);
    expect(leafDescendants.has(3)).toBe(true);
  });

  it("handles empty storage list", () => {
    const map = buildDescendantsMap([]);
    expect(map.size).toBe(0);
  });
});

describe("buildWineGroupedOptions", () => {
  const wines: Wine[] = [
    { id: 1, name: "Alpha Red", wineMakerId: 1, regionId: null, type: "red" },
    { id: 2, name: "Alpha White", wineMakerId: 1, regionId: null, type: "white" },
    { id: 3, name: "Beta Red", wineMakerId: 2, regionId: null, type: "red" },
  ];

  const winemakers: WineMaker[] = [
    { id: 1, name: "Alpha Winery" },
    { id: 2, name: "Beta Cellars" },
  ];

  it("groups wines by winemaker", () => {
    const groups = buildWineGroupedOptions(wines, winemakers);
    expect(groups).toHaveLength(2);
  });

  it("sorts winemakers alphabetically", () => {
    const groups = buildWineGroupedOptions(wines, winemakers);
    expect(groups[0].group).toBe("Alpha Winery");
    expect(groups[1].group).toBe("Beta Cellars");
  });

  it("includes correct wines in each group", () => {
    const groups = buildWineGroupedOptions(wines, winemakers);
    const alphaGroup = groups.find((g) => g.group === "Alpha Winery")!;
    expect(alphaGroup.options).toHaveLength(2);
    expect(alphaGroup.options.map((o) => o.label)).toContain("Alpha Red");
    expect(alphaGroup.options.map((o) => o.label)).toContain("Alpha White");
  });

  it("uses string IDs for option values", () => {
    const groups = buildWineGroupedOptions(wines, winemakers);
    const firstOption = groups[0].options[0];
    expect(typeof firstOption.value).toBe("string");
  });

  it("returns empty array for no wines", () => {
    const groups = buildWineGroupedOptions([], winemakers);
    expect(groups).toHaveLength(0);
  });
});
