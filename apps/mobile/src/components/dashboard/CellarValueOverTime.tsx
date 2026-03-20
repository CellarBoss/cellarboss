import { View, StyleSheet } from "react-native";
import { Card, Text } from "react-native-paper";
import { parseISO, format } from "date-fns";
import type { Bottle } from "@cellarboss/types";
import { formatPrice } from "@/lib/functions/format";
import { theme } from "@/lib/theme";

type CellarValueOverTimeProps = {
  bottles: Bottle[];
  currency: string;
};

export function CellarValueOverTime({
  bottles,
  currency,
}: CellarValueOverTimeProps) {
  const storedBottles = bottles.filter((b) => b.status === "stored");

  const totalValue = storedBottles.reduce(
    (sum, b) => sum + (b.purchasePrice || 0),
    0,
  );

  // Group by purchase month for sparkline
  const monthMap = new Map<string, number>();
  for (const bottle of storedBottles) {
    if (!bottle.purchaseDate) continue;
    try {
      const month = format(parseISO(bottle.purchaseDate), "yyyy-MM");
      monthMap.set(
        month,
        (monthMap.get(month) || 0) + (bottle.purchasePrice || 0),
      );
    } catch {
      // skip invalid dates
    }
  }

  const months = Array.from(monthMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  // Compute cumulative values
  let cumulative = 0;
  const cumulativeData = months.map(([month, value]) => {
    cumulative += value;
    return { month, cumulative };
  });

  const earliestMonth = months.length > 0 ? months[0][0] : null;
  const formattedEarliest = earliestMonth
    ? (() => {
        try {
          return format(parseISO(earliestMonth + "-01"), "MMM yyyy");
        } catch {
          return earliestMonth;
        }
      })()
    : null;

  const maxValue =
    cumulativeData.length > 0
      ? Math.max(...cumulativeData.map((d) => d.cumulative), 1)
      : 1;

  const BAR_MAX_HEIGHT = 48;
  const showSparkline = cumulativeData.length >= 2;

  return (
    <Card style={styles.card}>
      <Card.Title title="Cellar Value" />
      <Card.Content>
        <Text style={styles.totalValue}>
          {formatPrice(totalValue, currency)}
        </Text>
        {formattedEarliest && (
          <Text style={styles.subtitle}>
            Total purchase value since {formattedEarliest}
          </Text>
        )}
        {!formattedEarliest && (
          <Text style={styles.subtitle}>No bottles in cellar</Text>
        )}
        {showSparkline && (
          <View style={styles.sparkline}>
            {cumulativeData.map(({ month, cumulative: val }) => {
              const barH = Math.max((val / maxValue) * BAR_MAX_HEIGHT, 2);
              return (
                <View
                  key={month}
                  style={[
                    styles.sparkBar,
                    {
                      height: barH,
                      flex: 1,
                      backgroundColor: theme.colors.primary,
                      opacity: 0.6 + 0.4 * (val / maxValue),
                    },
                  ]}
                />
              );
            })}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 12,
  },
  sparkline: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 48,
    gap: 2,
    marginTop: 8,
  },
  sparkBar: {
    borderRadius: 2,
    minWidth: 4,
  },
});
