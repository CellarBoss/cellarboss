import { useState, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
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
import type { Grape } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
];

export default function GrapesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<Grape | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const grapesQuery = useApiQuery({
    queryKey: ["grapes"],
    queryFn: () => api.grapes.getAll(),
  });

  const result = queryGate([grapesQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.grapes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grapes"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["grapes"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [grapes] = result.data;

  const sortedGrapes = [...grapes].sort((a, b) => {
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
      <ScreenHeader title="Grapes" showBack />
      <DataList
        data={sortedGrapes}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search grapes..."
        searchFilter={(item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="fruit-grapes-outline"
        emptyTitle="No grapes yet"
        emptyMessage="Add your first grape variety to get started"
        emptyActionLabel="Add Grape"
        onEmptyAction={() => router.push("/grapes/new")}
        swipeActions={(grape) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/grapes/${grape.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(grape),
          },
        ]}
        renderItem={(grape) => (
          <Pressable
            style={styles.item}
            onPress={() => router.push(`/grapes/${grape.id}`)}
          >
            <Text style={styles.itemTitle} numberOfLines={1}>
              {grape.name}
            </Text>
          </Pressable>
        )}
      />

      <FAB
        testID="fab-add"
        icon="plus"
        style={styles.fab}
        onPress={() => router.push("/grapes/new")}
      />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Grape"
        message={
          deleteTarget
            ? `Delete grape "${deleteTarget.name}"? This cannot be undone. Grapes assigned to wines cannot be deleted.`
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
  itemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: theme.colors.primary,
  },
});
