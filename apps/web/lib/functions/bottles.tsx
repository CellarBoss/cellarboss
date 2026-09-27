import type { Vintage, Wine, WineMaker } from "@cellarboss/types";

export function getVintageName(
  vintageId: number,
  vintageMap: Map<number, Vintage>,
  wineMap: Map<number, Wine>,
  winemakerMap: Map<number, WineMaker>,
): string {
  const vintage = vintageMap.get(vintageId);
  if (!vintage) return "Unknown";
  const wine = wineMap.get(vintage.wineId);
  if (!wine) return `Unknown Wine ${vintage.year ?? "NV"}`;
  const winemakerName = winemakerMap.get(wine.wineMakerId)?.name;
  return `${winemakerName ? winemakerName + " - " : ""}${wine.name} ${vintage.year ?? "NV"}`;
}

export function buildWineGroupedOptions(
  wines: Wine[],
  winemakers: WineMaker[],
): Array<{ group: string; options: Array<{ value: string; label: string }> }> {
  const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm.name]));

  // Group wines by winemaker
  const grouped = new Map<number, Wine[]>();
  for (const wine of wines) {
    if (!grouped.has(wine.wineMakerId)) {
      grouped.set(wine.wineMakerId, []);
    }
    grouped.get(wine.wineMakerId)!.push(wine);
  }

  // Sort winemakers by name and build the grouped options
  const sortedWinemakers = Array.from(grouped.entries()).sort(
    ([idA], [idB]) => {
      const nameA = winemakerMap.get(idA) || "";
      const nameB = winemakerMap.get(idB) || "";
      return nameA.localeCompare(nameB);
    },
  );

  return sortedWinemakers.map(([wineMakerId, winesInGroup]) => ({
    group: winemakerMap.get(wineMakerId) || "Unknown Winemaker",
    options: winesInGroup
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((wine) => ({
        value: String(wine.id),
        label: wine.name,
      })),
  }));
}
