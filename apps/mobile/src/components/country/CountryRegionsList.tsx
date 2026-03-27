import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme, shadows } from "@/lib/theme";

export function CountryRegionsList({ countryId }: { countryId: number }) {
  const router = useRouter();

  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: () => api.regions.getAll(),
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });

  const result = queryGate([regionQuery, wineQuery]);
  if (!result.ready) return result.gate;

  const [regions, wines] = result.data;

  const wineCountByRegion = new Map<number, number>();
  for (const wine of wines) {
    if (wine.regionId !== null) {
      wineCountByRegion.set(
        wine.regionId,
        (wineCountByRegion.get(wine.regionId) ?? 0) + 1,
      );
    }
  }
  const filtered = regions
    .filter((r) => r.countryId === countryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <View style={styles.section}>
      <Text variant="titleSmall" style={styles.heading}>
        Regions
      </Text>
      <View style={styles.card}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No regions yet</Text>
        ) : (
          filtered.map((region, index) => {
            const isLast = index === filtered.length - 1;

            return (
              <Pressable
                key={region.id}
                style={[styles.row, isLast && styles.rowLast]}
                onPress={() => router.push(`/regions/${region.id}`)}
              >
                <Icon
                  source="map-marker"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.regionName} numberOfLines={1}>
                  {region.name}
                </Text>
                {(wineCountByRegion.get(region.id) ?? 0) > 0 && (
                  <View style={styles.badge}>
                    <Icon
                      source="glass-wine"
                      size={14}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text style={styles.badgeText}>
                      {wineCountByRegion.get(region.id)}
                    </Text>
                  </View>
                )}
                <Icon
                  source="chevron-right"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </Pressable>
            );
          })
        )}
      </View>
      <Pressable
        style={styles.addLink}
        onPress={() => router.push(`/regions/new?countryId=${countryId}`)}
      >
        <Icon source="plus" size={16} color={theme.colors.primary} />
        <Text style={styles.addText}>Add region</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 16,
  },
  heading: {
    color: theme.colors.onSurface,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    ...shadows.card,
    overflow: "hidden",
  },
  empty: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  regionName: {
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
  addLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 12,
  },
  addText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
  },
});
