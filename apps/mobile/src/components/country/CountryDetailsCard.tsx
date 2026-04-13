import { View, StyleSheet } from "react-native";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { Country } from "@cellarboss/types";
import { Icon, Text } from "react-native-paper";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";

export function CountryDetailsCard({ country }: { country: Country }) {
  const theme = useAppTheme();

  const regionQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: () => api.regions.getAll(),
  });

  const result = queryGate([regionQuery]);
  if (!result.ready) return result.gate;

  const [regions] = result.data;
  const regionCount = regions.filter((r) => r.countryId === country.id).length;

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
            <Text variant="titleMedium">{country.name}</Text>
            <View style={styles.detailRow}>
              <Icon
                source="map-marker"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                {regionCount} {regionCount === 1 ? "region" : "regions"}
              </Text>
            </View>
          </View>
          <Icon source="earth" size={40} color={theme.colors.primary} />
        </View>
      </View>
    </>
  );
}
