import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import type { Bottle, Vintage, Wine } from "@cellarboss/types";
import { theme } from "@/lib/theme";

type WineTypeBreakdownProps = {
  bottles: Bottle[];
  vintages: Vintage[];
  wines: Wine[];
};

const WINE_TYPE_COLORS: Record<string, string> = {
  red: "#8B1A1A",
  white: "#DAA520",
  rose: "#FF69B4",
  orange: "#FF8C00",
  sparkling: "#87CEEB",
  fortified: "#654321",
  dessert: "#9370DB",
};

const WINE_TYPE_LABELS: Record<string, string> = {
  red: "Red",
  white: "White",
  rose: "Rosé",
  orange: "Orange",
  sparkling: "Sparkling",
  fortified: "Fortified",
  dessert: "Dessert",
};

export function WineTypeBreakdown({
  bottles,
  vintages,
  wines,
}: WineTypeBreakdownProps) {
  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));

  const storedBottles = bottles.filter((b) => b.status === "stored");

  const counts: Record<string, number> = {};
  for (const bottle of storedBottles) {
    const vintage = vintageMap.get(bottle.vintageId);
    if (!vintage) continue;
    const wine = wineMap.get(vintage.wineId);
    if (!wine) continue;
    counts[wine.type] = (counts[wine.type] || 0) + 1;
  }

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const types = Object.entries(counts).sort(([, a], [, b]) => b - a);

  if (total === 0) {
    return (
      <Card style={styles.card}>
        <Card.Title title="Wine Types" />
        <Card.Content>
          <Text style={styles.empty}>No bottles in cellar</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="Wine Types" />
      <Card.Content>
        <View style={styles.bar}>
          {types.map(([type, count]) => (
            <View
              key={type}
              style={[
                styles.barSegment,
                {
                  flex: count,
                  backgroundColor: WINE_TYPE_COLORS[type] ?? "#999",
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.legend}>
          {types.map(([type, count]) => (
            <View key={type} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: WINE_TYPE_COLORS[type] ?? "#999" },
                ]}
              />
              <Text style={styles.legendLabel}>
                {WINE_TYPE_LABELS[type] ?? type}
              </Text>
              <Text style={styles.legendCount}>{count}</Text>
            </View>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
  },
  empty: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    paddingVertical: 16,
  },
  bar: {
    flexDirection: "row",
    height: 16,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  barSegment: {
    height: "100%",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: "28%",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    color: theme.colors.onSurface,
    flex: 1,
  },
  legendCount: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurfaceVariant,
  },
});
