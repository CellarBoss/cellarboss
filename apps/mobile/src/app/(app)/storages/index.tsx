import { useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text, FAB } from "react-native-paper";
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
import type { Storage, Location } from "@cellarboss/types";

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

  const result = queryGate([storagesQuery, locationsQuery]);

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

  const [storages, locations] = result.data;

  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const storageMap = new Map(storages.map((s) => [s.id, s]));

  function getLocationName(storage: Storage): string {
    if (!storage.locationId) return "";
    return locationMap.get(storage.locationId)?.name ?? "";
  }

  function getHierarchyPath(storage: Storage): string[] {
    const path: string[] = [];
    let current: Storage | undefined = storage;
    while (current?.parent) {
      const parentStorage = storageMap.get(current.parent);
      if (parentStorage) {
        path.unshift(parentStorage.name);
        current = parentStorage;
      } else {
        break;
      }
    }
    return path;
  }

  const sortedStorages = [...storages].sort((a, b) => {
    switch (currentSort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "location-asc":
        return getLocationName(a).localeCompare(getLocationName(b));
      case "location-desc":
        return getLocationName(b).localeCompare(getLocationName(a));
      default:
        return 0;
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Storages" showBack />
      <DataList
        data={sortedStorages}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search storages..."
        searchFilter={(item, query) => {
          const lower = query.toLowerCase();
          return (
            item.name.toLowerCase().includes(lower) ||
            getLocationName(item).toLowerCase().includes(lower)
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
        swipeActions={(storage) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/storages/${storage.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(storage),
          },
        ]}
        renderItem={(storage) => {
          const hierarchy = getHierarchyPath(storage);
          const locationName = getLocationName(storage);

          return (
            <Pressable
              style={styles.item}
              onPress={() => router.push(`/storages/${storage.id}`)}
            >
              {hierarchy.length > 0 && (
                <View style={styles.hierarchyRow}>
                  {hierarchy.map((name, i) => (
                    <View key={i} style={styles.hierarchySegment}>
                      {i > 0 && (
                        <Text style={styles.hierarchySeparator}>/</Text>
                      )}
                      <Text style={styles.hierarchyText}>{name}</Text>
                    </View>
                  ))}
                  <Text style={styles.hierarchySeparator}>/</Text>
                </View>
              )}
              <Text style={styles.itemTitle} numberOfLines={1}>
                {storage.name}
              </Text>
              {locationName !== "" && (
                <Text style={styles.itemSub} numberOfLines={1}>
                  {locationName}
                </Text>
              )}
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
  hierarchyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  hierarchySegment: {
    flexDirection: "row",
    alignItems: "center",
  },
  hierarchyText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  hierarchySeparator: {
    fontSize: 12,
    color: theme.colors.outlineVariant,
    marginHorizontal: 4,
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
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
