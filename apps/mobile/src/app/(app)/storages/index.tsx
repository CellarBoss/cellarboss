import { useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text, FAB, Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme } from "@/lib/theme";
import type { Storage, Bottle } from "@cellarboss/types";

type TreeNode = Storage & { subRows: TreeNode[] };
type FlatNode = { storage: Storage; depth: number };

function buildTree(storages: Storage[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];

  for (const s of storages) {
    map.set(s.id, { ...s, subRows: [] });
  }

  for (const node of map.values()) {
    if (node.parent != null && map.has(node.parent)) {
      map.get(node.parent)!.subRows.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function flattenTree(
  nodes: TreeNode[],
  sortFn: (a: Storage, b: Storage) => number,
  depth: number = 0,
): FlatNode[] {
  const sorted = [...nodes].sort(sortFn);
  const result: FlatNode[] = [];
  for (const node of sorted) {
    result.push({ storage: node, depth });
    if (node.subRows.length > 0) {
      result.push(...flattenTree(node.subRows, sortFn, depth + 1));
    }
  }
  return result;
}

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Location (A-Z)", value: "location-asc" },
  { label: "Location (Z-A)", value: "location-desc" },
];

export default function StoragesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<Storage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: () => api.storages.getAll(),
  });
  const locationsQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: () => api.locations.getAll(),
  });
  const bottlesQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: () => api.bottles.getAll(),
  });

  const result = queryGate([storagesQuery, locationsQuery, bottlesQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.storages.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storages"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["storages"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [storages, locations, bottles] = result.data;

  const locationMap = new Map(locations.map((l) => [l.id, l]));

  const bottleCountByStorage = new Map<number, number>();
  for (const bottle of bottles) {
    if (bottle.status === "stored" && bottle.storageId != null) {
      bottleCountByStorage.set(
        bottle.storageId,
        (bottleCountByStorage.get(bottle.storageId) ?? 0) + 1,
      );
    }
  }

  function getLocationName(storage: Storage): string {
    if (!storage.locationId) return "";
    return locationMap.get(storage.locationId)?.name ?? "";
  }

  function getSortFn(sort: string): (a: Storage, b: Storage) => number {
    switch (sort) {
      case "name-desc":
        return (a, b) => b.name.localeCompare(a.name);
      case "location-asc":
        return (a, b) => getLocationName(a).localeCompare(getLocationName(b));
      case "location-desc":
        return (a, b) => getLocationName(b).localeCompare(getLocationName(a));
      case "name-asc":
      default:
        return (a, b) => a.name.localeCompare(b.name);
    }
  }

  const tree = buildTree(storages);
  const flatList = flattenTree(tree, getSortFn(currentSort));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Storages" showBack />
      <DataList
        data={flatList}
        keyExtractor={(item) => String(item.storage.id)}
        searchPlaceholder="Search storages..."
        searchFilter={(item, query) => {
          const lower = query.toLowerCase();
          return (
            item.storage.name.toLowerCase().includes(lower) ||
            getLocationName(item.storage).toLowerCase().includes(lower)
          );
        }}
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="warehouse"
        emptyTitle="No storages yet"
        emptyMessage="Add your first storage to get started"
        emptyActionLabel="Add Storage"
        onEmptyAction={() => router.push("/storages/new")}
        swipeActions={(item) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/storages/${item.storage.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(item.storage),
          },
        ]}
        renderItem={({ storage, depth }) => {
          const locationName = getLocationName(storage);
          const bottleCount = bottleCountByStorage.get(storage.id) ?? 0;

          return (
            <Pressable
              style={[styles.item, { paddingLeft: depth * 24 + 16 }]}
              onPress={() => router.push(`/storages/${storage.id}`)}
            >
              <View style={styles.itemRow}>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {storage.name}
                  </Text>
                  {locationName !== "" && (
                    <Text style={styles.itemSub} numberOfLines={1}>
                      {locationName}
                    </Text>
                  )}
                </View>
                {bottleCount > 0 && (
                  <View style={styles.bottleCount}>
                    <Icon
                      source="bottle-wine"
                      size={16}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text style={styles.bottleCountText}>{bottleCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/storages/new")}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Storage"
        message={
          deleteTarget
            ? `Delete storage "${deleteTarget.name}"? This cannot be undone. Storages with bottles or child storages cannot be deleted.`
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  item: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  bottleCount: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bottleCountText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.onSurfaceVariant,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
