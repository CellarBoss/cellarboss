import { View, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import type { Location } from "@cellarboss/types";

export function LocationDetailsCard({ location }: { location: Location }) {
  const theme = useAppTheme();

  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: () => api.storages.getAll(),
  });

  const result = queryGate([storagesQuery]);
  if (!result.ready) return result.gate;

  const [storages] = result.data;
  const storageCount = storages.filter(
    (s) => s.locationId === location.id,
  ).length;

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
            <Text variant="titleMedium">{location.name}</Text>
            <View style={styles.detailRow}>
              <Icon
                source="warehouse"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                {storageCount} {storageCount === 1 ? "storage" : "storages"}
              </Text>
            </View>
          </View>
          <Icon
            source="map-marker-radius-outline"
            size={40}
            color={theme.colors.primary}
          />
        </View>
      </View>
    </>
  );
}
