import { View, ScrollView, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme, shadows } from "@/lib/theme";
import { formatDrinkingStatus } from "@/lib/functions/format";
import { BottleListItem } from "@/components/bottle/BottleListItem";
import { BottleCountBadge } from "@/components/storage/BottleCountBadge";
import type { Storage } from "@cellarboss/types";
import type { WineType } from "@cellarboss/validators/constants";

export default function ViewStorageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const storageQuery = useApiQuery({
    queryKey: ["storages", Number(id)],
    queryFn: () => api.storages.getById(Number(id)),
  });
  const allStoragesQuery = useApiQuery({
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
  const vintagesQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: () => api.vintages.getAll(),
  });
  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });
  const winemakersQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });

  const result = queryGate([
    storageQuery,
    allStoragesQuery,
    locationsQuery,
    bottlesQuery,
    vintagesQuery,
    winesQuery,
    winemakersQuery,
  ]);
  if (!result.ready) return result.gate;

  const [
    storage,
    allStorages,
    locations,
    bottles,
    vintages,
    wines,
    winemakers,
  ] = result.data;

  const storageMap = new Map(allStorages.map((s) => [s.id, s]));
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((m) => [m.id, m]));

  // Build parent hierarchy path
  const hierarchyPath: Storage[] = [];
  let current: Storage | undefined = storage;
  while (current?.parent != null) {
    const parent = storageMap.get(current.parent);
    if (parent) {
      hierarchyPath.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  const location = storage.locationId
    ? locationMap.get(storage.locationId)
    : null;

  const childStorages = allStorages
    .filter((s) => s.parent === storage.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const currentYear = new Date().getFullYear();

  // Filter bottles stored in this storage
  const storedBottles = bottles.filter(
    (b) => b.storageId === storage.id && b.status === "stored",
  );

  function getWineName(bottle: { vintageId: number }): string {
    const vintage = vintageMap.get(bottle.vintageId);
    if (!vintage) return "Unknown Wine";
    const wine = wineMap.get(vintage.wineId);
    return wine?.name ?? "Unknown Wine";
  }

  const sortedBottles = [...storedBottles].sort((a, b) =>
    getWineName(a).localeCompare(getWineName(b)),
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={storage.name}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/storages/${id}/edit`),
          },
        ]}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="titleSmall" style={styles.heading}>
          Details
        </Text>
        <View style={styles.card}>
          <View style={styles.detailsRow}>
            <View style={styles.detailsContent}>
              {hierarchyPath.length > 0 && (
                <View style={styles.hierarchyRow}>
                  {hierarchyPath.map((ancestor, i) => (
                    <View key={ancestor.id} style={styles.hierarchySegment}>
                      {i > 0 && (
                        <Icon
                          source="chevron-right"
                          size={14}
                          color={theme.colors.onSurfaceVariant}
                        />
                      )}
                      <Pressable
                        onPress={() => router.push(`/storages/${ancestor.id}`)}
                      >
                        <Text style={styles.hierarchyText}>
                          {ancestor.name}
                        </Text>
                      </Pressable>
                    </View>
                  ))}
                  <Icon
                    source="chevron-right"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                  />
                </View>
              )}
              <Text variant="titleMedium">{storage.name}</Text>
              {location && (
                <View style={styles.detailItem}>
                  <Icon
                    source="map-marker"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {location.name}
                  </Text>
                </View>
              )}
              {childStorages.length > 0 && (
                <View style={styles.detailItem}>
                  <Icon
                    source="file-tree"
                    size={16}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {childStorages.length}{" "}
                    {childStorages.length === 1
                      ? "sub-storage"
                      : "sub-storages"}
                  </Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Icon
                  source="bottle-wine"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {storedBottles.length}{" "}
                  {storedBottles.length === 1 ? "bottle" : "bottles"} stored
                </Text>
              </View>
            </View>
            <Icon source="warehouse" size={40} color={theme.colors.primary} />
          </View>
        </View>

        {childStorages.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleSmall" style={styles.heading}>
              Sub-storages
            </Text>
            <View style={styles.card}>
              {childStorages.map((child, index) => {
                const isLast = index === childStorages.length - 1;
                return (
                  <Pressable
                    key={child.id}
                    style={[styles.bottleRow, isLast && styles.rowLast]}
                    onPress={() => router.push(`/storages/${child.id}`)}
                  >
                    <Text style={styles.childName} numberOfLines={1}>
                      {child.name}
                    </Text>
                    <BottleCountBadge
                      count={
                        bottles.filter(
                          (b) =>
                            b.storageId === child.id && b.status === "stored",
                        ).length
                      }
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text variant="titleSmall" style={styles.heading}>
            Bottles
          </Text>
          <View style={styles.bottlesCard}>
            {sortedBottles.length === 0 ? (
              <Text style={styles.empty}>No bottles in this storage</Text>
            ) : (
              sortedBottles.map((bottle) => {
                const vintage = vintageMap.get(bottle.vintageId);
                const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
                const maker = wine
                  ? winemakerMap.get(wine.wineMakerId)
                  : undefined;
                const drinkingStatus = formatDrinkingStatus(
                  vintage?.drinkFrom ?? null,
                  vintage?.drinkUntil ?? null,
                  currentYear,
                );
                return (
                  <BottleListItem
                    key={bottle.id}
                    bottle={bottle}
                    wineName={wine?.name ?? "Unknown Wine"}
                    wineYear={
                      vintage?.year != null ? String(vintage.year) : "NV"
                    }
                    winemakerName={maker?.name ?? ""}
                    wineType={wine?.type as WineType | undefined}
                    drinkingStatus={drinkingStatus}
                    onPress={() => router.push(`/bottles/${bottle.id}`)}
                    swipeable
                  />
                );
              })
            )}
          </View>
        </View>
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
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  bottlesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    overflow: "hidden" as const,
    ...shadows.card,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  detailsContent: {
    flex: 1,
    gap: 4,
  },
  hierarchyRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 2,
  },
  hierarchySegment: {
    flexDirection: "row",
    alignItems: "center",
  },
  hierarchyText: {
    fontSize: 13,
    color: theme.colors.primary,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    color: theme.colors.onSurfaceVariant,
  },
  section: {
    marginTop: 16,
  },
  empty: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  bottleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  childName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
});
