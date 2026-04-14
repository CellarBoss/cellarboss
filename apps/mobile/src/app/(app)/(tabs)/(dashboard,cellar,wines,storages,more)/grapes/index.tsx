import { useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { AddFAB } from "@/components/AddFAB";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { CountBadge } from "@/components/CountBadge";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { useCommonStyles } from "@/styles/common";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Grape } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
];

export default function GrapesScreen() {
  const commonStyles = useCommonStyles();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    item: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    row: {
      justifyContent: "space-between",
    },
    title: {
      flex: 1,
      marginRight: 12,
    },
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<Grape | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const grapesQuery = useApiQuery({
    queryKey: ["grapes"],
    queryFn: () => api.grapes.getAll(),
  });
  const winegrapesQuery = useApiQuery({
    queryKey: ["winegrapes"],
    queryFn: () => api.winegrapes.getAll(),
  });

  const result = queryGate([grapesQuery, winegrapesQuery]);

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

  const [grapes, winegrapes] = result.data;

  const wineCountByGrape = new Map<number, number>();
  for (const wg of winegrapes) {
    wineCountByGrape.set(
      wg.grapeId,
      (wineCountByGrape.get(wg.grapeId) ?? 0) + 1,
    );
  }

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
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
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
        renderItem={(grape) => {
          const wineCount = wineCountByGrape.get(grape.id) ?? 0;
          return (
            <Pressable
              style={styles.item}
              onPress={() => router.push(`/grapes/${grape.id}`)}
            >
              <View style={[commonStyles.listItemRow, styles.row]}>
                <Text
                  style={[commonStyles.listItemTitle, styles.title]}
                  numberOfLines={1}
                >
                  {grape.name}
                </Text>
                {wineCount > 0 && (
                  <CountBadge icon="glass-wine" count={wineCount} />
                )}
              </View>
            </Pressable>
          );
        }}
      />

      <AddFAB onPress={() => router.push("/grapes/new")} />

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
