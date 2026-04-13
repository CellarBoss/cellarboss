import { View, StyleSheet } from "react-native";
import { Icon, Text } from "react-native-paper";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Grape } from "@cellarboss/types";

export function GrapeDetailsCard({ grape }: { grape: Grape }) {
  const theme = useAppTheme();

  const winegrapesQuery = useApiQuery({
    queryKey: ["winegrapes"],
    queryFn: () => api.winegrapes.getAll(),
  });

  const result = queryGate([winegrapesQuery]);
  if (!result.ready) return result.gate;

  const [winegrapes] = result.data;
  const wineCount = winegrapes.filter((wg) => wg.grapeId === grape.id).length;

  const styles = StyleSheet.create({
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
  });

  return (
    <>
      <Text variant="titleSmall" style={styles.heading}>
        Details
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.details}>
            <Text variant="titleMedium">{grape.name}</Text>
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
          <Icon
            source="fruit-grapes-outline"
            size={40}
            color={theme.colors.primary}
          />
        </View>
      </View>
    </>
  );
}
