import { useState, useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
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
import { commonStyles } from "@/styles/common";
import { theme } from "@/lib/theme";
import type { Region } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
  { label: "Country (A-Z)", value: "country-asc" },
  { label: "Country (Z-A)", value: "country-desc" },
];

export default function RegionsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<Region | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const regionsQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: () => api.regions.getAll(),
  });
  const countriesQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: () => api.countries.getAll(),
  });

  const result = queryGate([regionsQuery, countriesQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.regions.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["regions"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["regions"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [regions, countries] = result.data;

  const countryMap = new Map(countries.map((c) => [c.id, c]));

  function getCountryName(region: Region): string {
    return countryMap.get(region.countryId)?.name ?? "";
  }

  const sortedRegions = [...regions].sort((a, b) => {
    switch (currentSort) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "country-asc":
        return getCountryName(a).localeCompare(getCountryName(b));
      case "country-desc":
        return getCountryName(b).localeCompare(getCountryName(a));
      default:
        return 0;
    }
  });

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Regions" showBack />
      <DataList
        data={sortedRegions}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search regions..."
        searchFilter={(item, query) => {
          const lower = query.toLowerCase();
          return (
            item.name.toLowerCase().includes(lower) ||
            getCountryName(item).toLowerCase().includes(lower)
          );
        }}
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="map-marker-outline"
        emptyTitle="No regions yet"
        emptyMessage="Add your first region to get started"
        emptyActionLabel="Add Region"
        onEmptyAction={() => router.push("/regions/new")}
        swipeActions={(region) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/regions/${region.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(region),
          },
        ]}
        renderItem={(region) => (
          <Pressable
            style={commonStyles.listItem}
            onPress={() => router.push(`/regions/${region.id}`)}
          >
            <Text
              style={[commonStyles.listItemTitle, styles.title]}
              numberOfLines={1}
            >
              {region.name}
            </Text>
            <Text style={commonStyles.listItemSub} numberOfLines={1}>
              {getCountryName(region)}
            </Text>
          </Pressable>
        )}
      />

      <AddFAB onPress={() => router.push("/regions/new")} />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Region"
        message={
          deleteTarget
            ? `Delete region "${deleteTarget.name}"? This cannot be undone. Regions with wines cannot be deleted.`
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
  title: {
    marginBottom: 2,
  },
});
