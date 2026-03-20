import { useState, useCallback, useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text, FAB, Chip } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSetting } from "@/hooks/use-settings";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatPrice } from "@/lib/functions/format";
import { theme } from "@/lib/theme";
import type { Bottle } from "@cellarboss/types";
import { formatStatus } from "@/lib/functions/format";

const STATUS_COLORS: Record<string, string> = {
  stored: "#2E8B57",
  ordered: "#3B82F6",
  drunk: "#9CA3AF",
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] ?? "#6B7280";
}

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
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("purchaseDate-desc");
  const [deleteTarget, setDeleteTarget] = useState<Bottle | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const currencySetting = useSetting("currency");
  const currency = (currencySetting.data as string) || "USD";

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

  const result = queryGate([
    bottleQuery,
    vintageQuery,
    wineQuery,
    winemakerQuery,
    storageQuery,
  ]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.bottles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bottles"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["bottles"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [bottles, vintages, wines, winemakers, storages] = result.data;

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((m) => [m.id, m]));
  const storageMap = new Map(storages.map((s) => [s.id, s]));

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

  function getStorageName(bottle: Bottle): string {
    if (!bottle.storageId) return "No storage";
    return storageMap.get(bottle.storageId)?.name ?? "Unknown storage";
  }

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
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.content}>
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
          onRefresh={handleRefresh}
          refreshing={refreshing}
          emptyIcon="bottle-wine"
          emptyTitle="No bottles yet"
          emptyMessage="Add your first bottle to get started"
          emptyActionLabel="Add Bottle"
          onEmptyAction={() => router.push("/bottles/new")}
          swipeActions={(bottle) => [
            {
              icon: "pencil",
              color: theme.colors.primary,
              onPress: () => router.push(`/bottles/${bottle.id}/edit`),
            },
            {
              icon: "delete",
              color: "#dc2626",
              onPress: () => setDeleteTarget(bottle),
            },
          ]}
          renderItem={(bottle) => (
            <BottleListItem
              bottle={bottle}
              wineName={getWineName(bottle)}
              wineYear={getWineYear(bottle)}
              winemakerName={getWinemakerName(bottle)}
              storageName={getStorageName(bottle)}
              currency={currency}
              onPress={() => router.push(`/bottles/${bottle.id}`)}
            />
          )}
        />
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/bottles/new")}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Bottle"
        message={
          deleteTarget
            ? `Delete this bottle of ${getWineName(deleteTarget)}? This cannot be undone.`
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

type BottleListItemProps = {
  bottle: Bottle;
  wineName: string;
  wineYear: string;
  winemakerName: string;
  storageName: string;
  currency: string;
  onPress: () => void;
};

function BottleListItem({
  bottle,
  wineName,
  wineYear,
  winemakerName,
  storageName,
  currency,
  onPress,
}: BottleListItemProps) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemTop}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {wineName} {wineYear}
        </Text>
        <Chip
          style={[
            styles.statusChip,
            { backgroundColor: getStatusColor(bottle.status) },
          ]}
          textStyle={styles.statusChipText}
          compact
        >
          {formatStatus(bottle.status)}
        </Chip>
      </View>
      <Text style={styles.itemSub} numberOfLines={1}>
        {winemakerName}
        {winemakerName ? " · " : ""}
        {storageName} · {formatPrice(bottle.purchasePrice, currency)}
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
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  statusChip: {
    height: 30,
  },
  statusChipText: {
    color: "#fff",
    fontSize: 11,
    lineHeight: 14,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
