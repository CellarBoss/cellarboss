import { View, StyleSheet } from "react-native";
import { theme, shadows } from "@/lib/theme";
import { WineMaker } from "@cellarboss/types";
import { Icon, Text } from "react-native-paper";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";

export function WinemakerDetailsCard({ winemaker }: { winemaker: WineMaker }) {
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });

  const result = queryGate([wineQuery]);
  if (!result.ready) return result.gate;

  const [wines] = result.data;
  const wineCount = wines.filter((w) => w.wineMakerId === winemaker.id).length;

  return (
    <>
      <Text variant="titleSmall" style={styles.heading}>
        Details
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.details}>
            <Text variant="titleMedium">{winemaker.name}</Text>
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
          <Icon source="account" size={40} color={theme.colors.primary} />
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
