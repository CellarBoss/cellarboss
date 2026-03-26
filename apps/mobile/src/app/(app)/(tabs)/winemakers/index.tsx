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
import type { WineMaker } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
];

export default function WinemakersScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<WineMaker | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const winemakersQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });
  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });

  const result = queryGate([winemakersQuery, winesQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.winemakers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["winemakers"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["winemakers"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [winemakers, wines] = result.data;

  const wineCountByWinemaker = new Map<number, number>();
  for (const wine of wines) {
    wineCountByWinemaker.set(
      wine.wineMakerId,
      (wineCountByWinemaker.get(wine.wineMakerId) ?? 0) + 1,
    );
  }

  const sortedWinemakers = [...winemakers].sort((a, b) => {
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
      <ScreenHeader title="Winemakers" showBack />
      <DataList
        data={sortedWinemakers}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search winemakers..."
        searchFilter={(item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="account-group-outline"
        emptyTitle="No winemakers yet"
        emptyMessage="Add your first winemaker to get started"
        emptyActionLabel="Add Winemaker"
        onEmptyAction={() => router.push("/winemakers/new")}
        swipeActions={(winemaker) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/winemakers/${winemaker.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(winemaker),
          },
        ]}
        renderItem={(winemaker) => {
          const wineCount = wineCountByWinemaker.get(winemaker.id) ?? 0;
          return (
            <Pressable
              style={styles.item}
              onPress={() => router.push(`/winemakers/${winemaker.id}`)}
            >
              <View style={styles.itemRow}>
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {winemaker.name}
                </Text>
                {wineCount > 0 && (
                  <View style={styles.badge}>
                    <Icon
                      source="glass-wine"
                      size={14}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text style={styles.badgeText}>{wineCount}</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      <FAB
        testID="fab-add"
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/winemakers/new")}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Winemaker"
        message={
          deleteTarget
            ? `Delete winemaker "${deleteTarget.name}"? This cannot be undone. Winemakers with wines cannot be deleted.`
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
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    flex: 1,
    marginRight: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeText: {
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
