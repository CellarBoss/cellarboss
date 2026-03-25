import { View, StyleSheet } from "react-native";
import { theme, shadows } from "@/lib/theme";
import { Wine } from "@cellarboss/types";
import { Icon, Text } from "react-native-paper";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { WINE_TYPE_COLORS } from "@/lib/constants/wines";

export function WineDetailsCard({ wine }: { wine: Wine }) {
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });
  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: () => api.regions.getAll(),
  });
  const countryQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: () => api.countries.getAll(),
  });
  const wineGrapeQuery = useApiQuery({
    queryKey: ["winegrapes", "wine", wine.id],
    queryFn: () => api.winegrapes.getByWineId(wine.id),
  });
  const grapeQuery = useApiQuery({
    queryKey: ["grapes"],
    queryFn: () => api.grapes.getAll(),
  });

  const result = queryGate([
    winemakerQuery,
    regionQuery,
    countryQuery,
    wineGrapeQuery,
    grapeQuery,
  ]);
  if (!result.ready) return result.gate;

  const [winemakers, regions, countries, wineGrapes, grapes] = result.data;
  const winemaker = winemakers.find((wm) => wm.id === wine.wineMakerId);
  const region = regions.find((r) => r.id === wine.regionId);
  const country = countries.find((c) => c.id === region?.countryId);

  return (
    <>
      <Text variant="titleSmall" style={styles.heading}>
        Details
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.details}>
            <Text variant="titleMedium">{wine.name}</Text>
            {winemaker && (
              <View style={styles.detailRow}>
                <Icon
                  source="account"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {winemaker.name}
                </Text>
              </View>
            )}
            {(region || country) && (
              <View style={styles.detailRow}>
                <Icon
                  source="earth"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {[region?.name, country?.name].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
            {wineGrapes.length > 0 && (
              <View style={styles.detailRow}>
                <Icon
                  source="fruit-grapes"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {wineGrapes
                    .map((wg) => grapes.find((g) => g.id === wg.grapeId)?.name)
                    .join(", ")}
                </Text>
              </View>
            )}
          </View>
          <Icon
            source="bottle-wine"
            size={40}
            color={WINE_TYPE_COLORS[wine.type]}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: theme.colors.onSurface,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    color: theme.colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    ...shadows.card,
  },
  error: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  success: {
    color: "#16a34a",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    minWidth: 100,
  },
});
