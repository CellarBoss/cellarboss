import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { AddFAB } from "@/components/AddFAB";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { WineListItem } from "@/components/wine/WineListItem";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { useCommonStyles } from "@/styles/common";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Wine } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Winemaker (A-Z)", value: "winemaker-asc" },
  { label: "Winemaker (Z-A)", value: "winemaker-desc" },
  { label: "Type", value: "type-asc" },
];

export default function WinesScreen() {
  const commonStyles = useCommonStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<Wine | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });
  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: () => api.regions.getAll(),
  });
  const countryQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: () => api.countries.getAll(),
  });

  const result = queryGate([
    wineQuery,
    winemakerQuery,
    regionQuery,
    countryQuery,
  ]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.wines.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wines"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["wines"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [wines, winemakers, regions, countries] = result.data;

  const winemakerMap = new Map(winemakers.map((m) => [m.id, m]));
  const regionMap = new Map(regions.map((r) => [r.id, r]));
  const countryMap = new Map(countries.map((c) => [c.id, c]));

  function getWinemakerName(wine: Wine): string {
    return winemakerMap.get(wine.wineMakerId)?.name ?? "";
  }

  function getRegionDisplay(wine: Wine): string {
    if (!wine.regionId) return "";
    const region = regionMap.get(wine.regionId);
    if (!region) return "";
    const country = countryMap.get(
      (region as { countryId?: number }).countryId ?? 0,
    );
    return country ? `${region.name}, ${country.name}` : region.name;
  }

  const sortedWines = [...wines].sort((a, b) => {
    switch (currentSort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "winemaker-asc":
        return getWinemakerName(a).localeCompare(getWinemakerName(b));
      case "winemaker-desc":
        return getWinemakerName(b).localeCompare(getWinemakerName(a));
      case "type-asc":
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <DataList
        data={sortedWines}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search wines..."
        searchFilter={(item, query) => {
          const lower = query.toLowerCase();
          return (
            item.name.toLowerCase().includes(lower) ||
            getWinemakerName(item).toLowerCase().includes(lower)
          );
        }}
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="glass-wine"
        emptyTitle="No wines yet"
        emptyMessage="Add your first wine to get started"
        emptyActionLabel="Add Wine"
        onEmptyAction={() => router.push("/wines/new")}
        swipeActions={(wine) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/wines/${wine.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(wine),
          },
        ]}
        renderItem={(wine) => (
          <WineListItem
            wine={wine}
            winemakerName={getWinemakerName(wine)}
            regionDisplay={getRegionDisplay(wine)}
            onPress={() => router.push(`/wines/${wine.id}`)}
          />
        )}
      />

      <AddFAB onPress={() => router.push("/wines/new")} />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Wine"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"? This cannot be undone. Wines with vintages cannot be deleted.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}
