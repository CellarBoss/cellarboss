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
import { theme } from "@/lib/theme";
import type { Country } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
];

export default function CountriesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("name-asc");
  const [deleteTarget, setDeleteTarget] = useState<Country | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const countriesQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: () => api.countries.getAll(),
  });

  const result = queryGate([countriesQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.countries.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["countries"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["countries"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [countries] = result.data;

  const sortedCountries = [...countries].sort((a, b) => {
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
      <ScreenHeader title="Countries" showBack />
      <DataList
        data={sortedCountries}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search countries..."
        searchFilter={(item, query) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        }
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="earth"
        emptyTitle="No countries yet"
        emptyMessage="Add your first country to get started"
        emptyActionLabel="Add Country"
        onEmptyAction={() => router.push("/countries/new")}
        swipeActions={(country) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/countries/${country.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(country),
          },
        ]}
        renderItem={(country) => (
          <Pressable
            style={styles.item}
            onPress={() => router.push(`/countries/${country.id}`)}
          >
            <Text style={styles.itemTitle} numberOfLines={1}>
              {country.name}
            </Text>
          </Pressable>
        )}
      />

      <AddFAB onPress={() => router.push("/countries/new")} />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Country"
        message={
          deleteTarget
            ? `Delete country "${deleteTarget.name}"? This cannot be undone. Countries with regions cannot be deleted.`
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
});
