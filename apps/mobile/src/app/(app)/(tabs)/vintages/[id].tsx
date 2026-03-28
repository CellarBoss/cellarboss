import { View, ScrollView, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { VintageDetailsCard } from "@/components/vintage/VintageDetailsCard";
import { BottleListItem } from "@/components/bottle/BottleListItem";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatDrinkingStatus } from "@/lib/functions/format";
import { theme, shadows } from "@/lib/theme";
import { VintageTastingNotesList } from "@/components/tasting-notes/TastingNotesList";
import type { Storage } from "@cellarboss/types";
import type { WineType } from "@cellarboss/validators/constants";

export default function ViewVintageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const vintageQuery = useApiQuery({
    queryKey: ["vintages", Number(id)],
    queryFn: () => api.vintages.getById(Number(id)),
  });
  const bottlesQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: () => api.bottles.getAll(),
  });
  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });
  const winemakersQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });
  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: () => api.storages.getAll(),
  });

  const result = queryGate([
    vintageQuery,
    bottlesQuery,
    winesQuery,
    winemakersQuery,
    storagesQuery,
  ]);
  if (!result.ready) return result.gate;

  const [vintage, bottles, wines, winemakers, storages] = result.data;

  const wine = wines.find((w) => w.id === vintage.wineId);
  const wineName = wine?.name ?? "Unknown Wine";
  const yearLabel = vintage.year != null ? String(vintage.year) : "NV";

  const storageMap = new Map(storages.map((s) => [s.id, s]));
  const winemakerMap = new Map(winemakers.map((m) => [m.id, m]));

  const currentYear = new Date().getFullYear();
  const drinkingStatus = formatDrinkingStatus(
    vintage.drinkFrom,
    vintage.drinkUntil,
    currentYear,
  );

  function getStorageHierarchy(storageId: number | null): string[] {
    if (storageId == null) return [];
    const path: string[] = [];
    let current: Storage | undefined = storageMap.get(storageId);
    while (current) {
      path.unshift(current.name);
      current =
        current.parent != null ? storageMap.get(current.parent) : undefined;
    }
    return path;
  }

  const vintageBottles = bottles
    .filter((b) => b.vintageId === vintage.id)
    .sort((a, b) => {
      if (a.status === "stored" && b.status !== "stored") return -1;
      if (a.status !== "stored" && b.status === "stored") return 1;
      return a.status.localeCompare(b.status);
    });

  const maker = wine ? winemakerMap.get(wine.wineMakerId) : undefined;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={`${wineName} ${yearLabel}`}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/vintages/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <VintageDetailsCard
          vintageId={vintage.id}
          onPress={wine ? () => router.push(`/wines/${wine.id}`) : undefined}
        />

        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.heading}>
            Bottles ({vintageBottles.length})
          </Text>
          <View style={styles.bottlesCard}>
            {vintageBottles.length === 0 ? (
              <Text style={styles.empty}>No bottles for this vintage</Text>
            ) : (
              vintageBottles.map((bottle) => (
                <BottleListItem
                  key={bottle.id}
                  bottle={bottle}
                  wineName={wineName}
                  wineYear={yearLabel}
                  winemakerName={maker?.name ?? ""}
                  storageHierarchy={getStorageHierarchy(bottle.storageId)}
                  wineType={wine?.type as WineType | undefined}
                  drinkingStatus={drinkingStatus}
                  onPress={() => router.push(`/bottles/${bottle.id}`)}
                  swipeable
                />
              ))
            )}
          </View>
        </View>

        <VintageTastingNotesList vintage={vintage} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    padding: 16,
  },
  heading: {
    color: theme.colors.onSurface,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  section: {
    marginTop: 16,
  },
  bottlesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: "hidden" as const,
    ...shadows.card,
  },
  empty: {
    padding: 16,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
});
