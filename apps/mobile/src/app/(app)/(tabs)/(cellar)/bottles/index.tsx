import { useState, useCallback } from "react";
import { AddFAB } from "@/components/AddFAB";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { BottleListItem } from "@/components/bottle/BottleListItem";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatDrinkingStatus } from "@/lib/functions/format";
import type { DrinkingStatus } from "@/lib/functions/format";
import { useCommonStyles } from "@/styles/common";
import {
  STATUS_FILTER_OPTIONS,
  WINE_TYPE_FILTER_OPTIONS,
} from "@/lib/constants/bottles";
import { DRINKING_STATUS_LABELS } from "@/lib/constants/drinking-status";
import type { Bottle, Storage } from "@cellarboss/types";
import type { WineType } from "@cellarboss/validators/constants";

const SORT_OPTIONS = [
  { label: "Purchase Date (Newest)", value: "purchaseDate-desc" },
  { label: "Purchase Date (Oldest)", value: "purchaseDate-asc" },
  { label: "Price (High to Low)", value: "price-desc" },
  { label: "Price (Low to High)", value: "price-asc" },
  { label: "Wine Name (A-Z)", value: "wineName-asc" },
  { label: "Wine Name (Z-A)", value: "wineName-desc" },
  { label: "Status", value: "status-asc" },
];

export default function CellarScreen() {
  const commonStyles = useCommonStyles();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("purchaseDate-desc");
  const [refreshing, setRefreshing] = useState(false);

  const bottleQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: () => api.bottles.getAll(),
  });
  const vintageQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: () => api.vintages.getAll(),
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });
  const storageQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: () => api.storages.getAll(),
  });
  const locationQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: () => api.locations.getAll(),
  });

  const result = queryGate([
    bottleQuery,
    vintageQuery,
    wineQuery,
    winemakerQuery,
    storageQuery,
    locationQuery,
  ]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["bottles"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [bottles, vintages, wines, winemakers, storages, locations] =
    result.data;

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((m) => [m.id, m]));
  const storageMap = new Map(storages.map((s) => [s.id, s]));
  const currentYear = new Date().getFullYear();

  function getWineName(bottle: Bottle): string {
    const vintage = vintageMap.get(bottle.vintageId);
    if (!vintage) return "Unknown Wine";
    const wine = wineMap.get(vintage.wineId);
    return wine?.name ?? "Unknown Wine";
  }

  function getWineYear(bottle: Bottle): string {
    const vintage = vintageMap.get(bottle.vintageId);
    return vintage?.year != null ? String(vintage.year) : "NV";
  }

  function getWinemakerName(bottle: Bottle): string {
    const vintage = vintageMap.get(bottle.vintageId);
    if (!vintage) return "";
    const wine = wineMap.get(vintage.wineId);
    if (!wine) return "";
    const maker = winemakerMap.get(wine.wineMakerId);
    return maker?.name ?? "";
  }

  function getStorageHierarchy(bottle: Bottle): string[] {
    if (!bottle.storageId) return [];
    const path: string[] = [];
    let current: Storage | undefined = storageMap.get(bottle.storageId);
    while (current) {
      path.unshift(current.name);
      current =
        current.parent != null ? storageMap.get(current.parent) : undefined;
    }
    return path;
  }

  function getWineType(bottle: Bottle): WineType | undefined {
    const vintage = vintageMap.get(bottle.vintageId);
    if (!vintage) return undefined;
    const wine = wineMap.get(vintage.wineId);
    return wine?.type as WineType | undefined;
  }

  function getDrinkingStatus(bottle: Bottle): DrinkingStatus {
    const vintage = vintageMap.get(bottle.vintageId);
    if (!vintage) return formatDrinkingStatus(null, null, currentYear);
    return formatDrinkingStatus(
      vintage.drinkFrom,
      vintage.drinkUntil,
      currentYear,
    );
  }

  function getLocationId(bottle: Bottle): number | null {
    if (!bottle.storageId) return null;
    const storage = storageMap.get(bottle.storageId);
    return storage?.locationId ?? null;
  }

  const drinkingStatusOptions: DrinkingStatus[] = [
    "drinkable",
    "wait",
    "past",
    "unknown",
  ];

  const locationFilterOptions = locations.map((l) => ({
    label: l.name,
    value: String(l.id),
  }));

  const filterConfigs = [
    {
      key: "status",
      label: "Status",
      options: STATUS_FILTER_OPTIONS,
      predicate: (bottle: Bottle, selectedValues: string[]) =>
        selectedValues.includes(bottle.status),
    },
    {
      key: "wineType",
      label: "Wine Type",
      options: WINE_TYPE_FILTER_OPTIONS,
      predicate: (bottle: Bottle, selectedValues: string[]) => {
        const type = getWineType(bottle);
        return type != null && selectedValues.includes(type);
      },
    },
    {
      key: "drinkingWindow",
      label: "Drinking Window",
      options: drinkingStatusOptions
        .filter((s) => DRINKING_STATUS_LABELS[s] !== "")
        .map((s) => ({
          label: DRINKING_STATUS_LABELS[s],
          value: s,
        })),
      predicate: (bottle: Bottle, selectedValues: string[]) =>
        selectedValues.includes(getDrinkingStatus(bottle)),
    },
    {
      key: "location",
      label: "Location",
      options: locationFilterOptions,
      predicate: (bottle: Bottle, selectedValues: string[]) => {
        const locationId = getLocationId(bottle);
        return (
          locationId != null && selectedValues.includes(String(locationId))
        );
      },
    },
  ];

  const sortedBottles = [...bottles].sort((a, b) => {
    switch (currentSort) {
      case "purchaseDate-asc":
        return a.purchaseDate.localeCompare(b.purchaseDate);
      case "purchaseDate-desc":
        return b.purchaseDate.localeCompare(a.purchaseDate);
      case "price-asc":
        return a.purchasePrice - b.purchasePrice;
      case "price-desc":
        return b.purchasePrice - a.purchasePrice;
      case "wineName-asc":
        return getWineName(a).localeCompare(getWineName(b));
      case "wineName-desc":
        return getWineName(b).localeCompare(getWineName(a));
      case "status-asc":
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <DataList
        data={sortedBottles}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search bottles..."
        searchFilter={(item, query) =>
          getWineName(item).toLowerCase().includes(query.toLowerCase())
        }
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        filterConfigs={filterConfigs}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="bottle-wine"
        emptyTitle="No bottles yet"
        emptyMessage="Add your first bottle to get started"
        emptyActionLabel="Add Bottle"
        onEmptyAction={() => router.push("/bottles/new")}
        renderItem={(bottle) => (
          <BottleListItem
            bottle={bottle}
            wineName={getWineName(bottle)}
            wineYear={getWineYear(bottle)}
            winemakerName={getWinemakerName(bottle)}
            storageHierarchy={getStorageHierarchy(bottle)}
            wineType={getWineType(bottle)}
            drinkingStatus={getDrinkingStatus(bottle)}
            onPress={() => router.push(`/bottles/${bottle.id}`)}
            swipeable
          />
        )}
      />

      <AddFAB onPress={() => router.push("/bottles/new")} />
    </SafeAreaView>
  );
}
