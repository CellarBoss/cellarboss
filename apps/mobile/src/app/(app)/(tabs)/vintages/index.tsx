import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { AddFAB } from "@/components/AddFAB";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { VintageListItem } from "@/components/vintage/VintageListItem";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { useCommonStyles } from "@/styles/common";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Vintage } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Year (Newest)", value: "year-desc" },
  { label: "Year (Oldest)", value: "year-asc" },
  { label: "Wine (A-Z)", value: "wine-asc" },
  { label: "Wine (Z-A)", value: "wine-desc" },
];

export default function VintagesScreen() {
  const commonStyles = useCommonStyles();
  const theme = useAppTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("year-desc");
  const [deleteTarget, setDeleteTarget] = useState<Vintage | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const vintageQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: () => api.vintages.getAll(),
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });

  const result = queryGate([vintageQuery, wineQuery]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.vintages.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vintages"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["vintages"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [vintages, wines] = result.data;

  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const currentYear = new Date().getFullYear();

  function getWineName(vintage: Vintage): string {
    return wineMap.get(vintage.wineId)?.name ?? "";
  }

  function getYearDisplay(vintage: Vintage): string {
    return vintage.year !== null ? String(vintage.year) : "NV";
  }

  const sortedVintages = [...vintages].sort((a, b) => {
    switch (currentSort) {
      case "year-desc":
        return (b.year ?? 0) - (a.year ?? 0);
      case "year-asc":
        return (a.year ?? 0) - (b.year ?? 0);
      case "wine-asc":
        return getWineName(a).localeCompare(getWineName(b));
      case "wine-desc":
        return getWineName(b).localeCompare(getWineName(a));
      default:
        return 0;
    }
  });

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Vintages" showBack />
      <DataList
        data={sortedVintages}
        keyExtractor={(item) => String(item.id)}
        searchPlaceholder="Search vintages..."
        searchFilter={(item, query) => {
          const lower = query.toLowerCase();
          return (
            getWineName(item).toLowerCase().includes(lower) ||
            getYearDisplay(item).toLowerCase().includes(lower)
          );
        }}
        sortOptions={SORT_OPTIONS}
        onSort={setCurrentSort}
        currentSort={currentSort}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        emptyIcon="calendar-range"
        emptyTitle="No vintages yet"
        emptyMessage="Add your first vintage to get started"
        emptyActionLabel="Add Vintage"
        onEmptyAction={() => router.push("/vintages/new")}
        swipeActions={(vintage) => [
          {
            icon: "pencil",
            color: theme.colors.primary,
            onPress: () => router.push(`/vintages/${vintage.id}/edit`),
          },
          {
            icon: "delete",
            color: "#dc2626",
            onPress: () => setDeleteTarget(vintage),
          },
        ]}
        renderItem={(vintage) => (
          <VintageListItem
            vintage={vintage}
            wineName={getWineName(vintage)}
            currentYear={currentYear}
            onPress={() => router.push(`/vintages/${vintage.id}`)}
          />
        )}
      />

      <AddFAB onPress={() => router.push("/vintages/new")} />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Vintage"
        message={
          deleteTarget
            ? `Delete vintage "${getWineName(deleteTarget)} ${getYearDisplay(deleteTarget)}"? This cannot be undone. Vintages with bottles cannot be deleted.`
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
