import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import {
  formatDrinkingStatus,
  type DrinkingStatus,
} from "@/lib/functions/format";
import { theme, shadows } from "@/lib/theme";

const STATUS_COLORS: Record<DrinkingStatus, string> = {
  drinkable: "#16a34a",
  wait: "#ca8a04",
  past: "#dc2626",
  unknown: theme.colors.onSurfaceVariant,
};

const STATUS_LABELS: Record<DrinkingStatus, string> = {
  drinkable: "Drinkable now",
  wait: "Wait to drink",
  past: "Past peak",
  unknown: "",
};

export function WineVintagesList({ wineId }: { wineId: number }) {
  const router = useRouter();

  const vintageQuery = useApiQuery({
    queryKey: ["vintages", "wine", wineId],
    queryFn: () => api.vintages.getByWineId(wineId),
  });
  const bottleQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: () => api.bottles.getAll(),
  });

  const result = queryGate([vintageQuery, bottleQuery]);
  if (!result.ready) return result.gate;

  const [vintages, bottles] = result.data;
  const currentYear = new Date().getFullYear();

  const vintageIds = new Set(vintages.map((v) => v.id));
  const bottleCountMap = new Map<number, number>();
  for (const bottle of bottles) {
    if (vintageIds.has(bottle.vintageId) && bottle.status === "stored") {
      bottleCountMap.set(
        bottle.vintageId,
        (bottleCountMap.get(bottle.vintageId) ?? 0) + 1,
      );
    }
  }

  const sorted = [...vintages].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));

  return (
    <View style={styles.section}>
      <Text variant="titleSmall" style={styles.heading}>
        Vintages
      </Text>
      <View style={styles.card}>
        {sorted.length === 0 ? (
          <Text style={styles.empty}>No vintages yet</Text>
        ) : (
          sorted.map((vintage, index) => {
            const status = formatDrinkingStatus(
              vintage.drinkFrom,
              vintage.drinkUntil,
              currentYear,
            );
            const bottleCount = bottleCountMap.get(vintage.id) ?? 0;
            const isLast = index === sorted.length - 1;

            return (
              <Pressable
                key={vintage.id}
                style={[styles.row, isLast && styles.rowLast]}
                onPress={() => router.push(`/vintages/${vintage.id}`)}
              >
                <Text style={styles.year}>
                  {vintage.year !== null ? vintage.year : "NV"}
                </Text>
                <Text
                  style={[styles.status, { color: STATUS_COLORS[status] }]}
                  numberOfLines={1}
                >
                  {STATUS_LABELS[status]}
                </Text>
                <View style={styles.bottles}>
                  <Icon
                    source="bottle-wine"
                    size={14}
                    color={theme.colors.onSurfaceVariant}
                  />
                  <Text style={styles.bottleCount}>{bottleCount}</Text>
                </View>
              </Pressable>
            );
          })
        )}
      </View>
      <Pressable
        style={styles.addLink}
        onPress={() => router.push(`/vintages/new?wineId=${wineId}`)}
      >
        <Icon source="plus" size={16} color={theme.colors.primary} />
        <Text style={styles.addText}>Add vintage</Text>
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
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  year: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
    width: 48,
  },
  status: {
    flex: 1,
    fontSize: 13,
  },
  bottles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  bottleCount: {
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
