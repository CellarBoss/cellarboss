import { View, StyleSheet } from "react-native";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Region } from "@cellarboss/types";
import { Icon, Text } from "react-native-paper";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";

export function RegionDetailsCard({ region }: { region: Region }) {
  const theme = useAppTheme();

  const countryQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: () => api.countries.getAll(),
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });

  const result = queryGate([countryQuery, wineQuery]);
  if (!result.ready) return result.gate;

  const [countries, wines] = result.data;
  const country = countries.find((c) => c.id === region.countryId);
  const wineCount = wines.filter((w) => w.regionId === region.id).length;

  const styles = StyleSheet.create({
    heading: {
      color: theme.colors.onSurface,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    details: {
      flex: 1,
      gap: 4,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
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
  });

  return (
    <>
      <Text variant="titleSmall" style={styles.heading}>
        Details
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.details}>
            <Text variant="titleMedium">{region.name}</Text>
            {country && (
              <View style={styles.detailRow}>
                <Icon
                  source="earth"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {country.name}
                </Text>
              </View>
            )}
            <View style={styles.detailRow}>
              <Icon
                source="bottle-wine"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                {wineCount} {wineCount === 1 ? "wine" : "wines"}
              </Text>
            </View>
          </View>
          <Icon source="map-marker" size={40} color={theme.colors.primary} />
        </View>
      </View>
    </>
  );
}
