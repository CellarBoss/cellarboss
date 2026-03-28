import { useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { AddFAB } from "@/components/AddFAB";
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
import type { Location } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
];

export default function LocationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<Location | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const locationsQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: () => api.locations.getAll(),
  });
  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: () => api.storages.getAll(),
  });

  const result = queryGate([locationsQuery, storagesQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.locations.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["locations"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [locations, storages] = result.data;

  const storageCountByLocation = new Map<number, number>();
  for (const storage of storages) {
    if (storage.locationId != null) {
      storageCountByLocation.set(
        storage.locationId,
        (storageCountByLocation.get(storage.locationId) ?? 0) + 1,
      );
    }
  }

  const sortedLocations = [...locations].sort((a, b) => {
    switch (currentSort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Locations" showBack />
      <DataList
        data={sortedLocations}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search locations..."
        searchFilter={(item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="map-marker-radius-outline"
        emptyTitle="No locations yet"
        emptyMessage="Add your first location to get started"
        emptyActionLabel="Add Location"
        onEmptyAction={() => router.push("/locations/new")}
        swipeActions={(location) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/locations/${location.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(location),
          },
        ]}
        renderItem={(location) => {
          const storageCount = storageCountByLocation.get(location.id) ?? 0;
          return (
            <Pressable
              style={styles.item}
              onPress={() => router.push(`/locations/${location.id}`)}
            >
              <View style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {location.name}
                </Text>
                {storageCount > 0 && (
                  <View style={styles.badge}>
                    <Icon
                      source="warehouse"
                      size={14}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text style={styles.badgeText}>{storageCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      <AddFAB onPress={() => router.push("/locations/new")} />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Location"
        message={
          deleteTarget
            ? `Delete location "${deleteTarget.name}"? This cannot be undone. Locations with storages cannot be deleted.`
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
});
