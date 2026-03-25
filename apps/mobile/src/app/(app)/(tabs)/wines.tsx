import { useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text, FAB } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import type { Wine } from "@cellarboss/types";
import { WINE_TYPE_COLORS, WINE_TYPE_LABELS } from "@/lib/constants/wines";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Winemaker (A-Z)", value: "winemaker-asc" },
  { label: "Winemaker (Z-A)", value: "winemaker-desc" },
  { label: "Type", value: "type-asc" },
];

export default function WinesScreen() {
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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
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
      </View>

      <FAB
        testID="fab-add"
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/wines/new")}
      />

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

type WineListItemProps = {
  wine: Wine;
  winemakerName: string;
  regionDisplay: string;
  onPress: () => void;
};

function WineListItem({
  wine,
  winemakerName,
  regionDisplay,
  onPress,
}: WineListItemProps) {
  return (
    <Pressable
      testID={`wine-item-${wine.id}`}
      style={styles.item}
      onPress={onPress}
    >
      <View style={styles.itemTop}>
        <View style={styles.nameRow}>
          <View
            style={[
              styles.typeDot,
              { backgroundColor: WINE_TYPE_COLORS[wine.type] },
            ]}
          />
          <Text style={styles.itemTitle} numberOfLines={1}>
            {wine.name}
          </Text>
        </View>
        <Text style={styles.typeLabel}>{WINE_TYPE_LABELS[wine.type]}</Text>
      </View>
      <Text style={styles.itemSub} numberOfLines={1}>
        {winemakerName}
        {winemakerName && regionDisplay ? " · " : ""}
        {regionDisplay}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  item: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  typeLabel: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 18,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
