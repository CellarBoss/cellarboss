import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Text } from "react-native-paper";
import type { Bottle, Vintage } from "@cellarboss/types";
import { theme } from "@/lib/theme";

type DrinkingWindowTimelineProps = {
  bottles: Bottle[];
  vintages: Vintage[];
};

const READY_COLOR = "#2E8B57";
const TOO_YOUNG_COLOR = "#BDB76B";
const PAST_PEAK_COLOR = "#CD5C5C";

export function DrinkingWindowTimeline({
  bottles,
  vintages,
}: DrinkingWindowTimelineProps) {
  const currentYear = new Date().getFullYear();
  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const storedBottles = bottles.filter((b) => b.status === "stored");

  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  const yearData = years.map((year) => {
    let ready = 0;
    let tooYoung = 0;
    let pastPeak = 0;

    for (const bottle of storedBottles) {
      const vintage = vintageMap.get(bottle.vintageId);
      if (!vintage) continue;
      const { drinkFrom, drinkUntil } = vintage;
      if (drinkFrom === null && drinkUntil === null) continue;
      if (drinkUntil !== null && year > drinkUntil) {
        pastPeak++;
      } else if (drinkFrom !== null && year < drinkFrom) {
        tooYoung++;
      } else {
        ready++;
      }
    }

    return { year, ready, tooYoung, pastPeak };
  });

  const maxTotal = Math.max(
    ...yearData.map((d) => d.ready + d.tooYoung + d.pastPeak),
    1,
  );

  const BAR_MAX_HEIGHT = 80;

  return (
    <Card style={styles.card}>
      <Card.Title title="Drinking Window" />
      <Card.Content>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chartContainer}
        >
          {yearData.map(({ year, ready, tooYoung, pastPeak }) => {
            const total = ready + tooYoung + pastPeak;
            const barHeight =
              total > 0 ? (total / maxTotal) * BAR_MAX_HEIGHT : 0;
            const readyH = total > 0 ? (ready / total) * barHeight : 0;
            const youngH = total > 0 ? (tooYoung / total) * barHeight : 0;
            const pastH = total > 0 ? (pastPeak / total) * barHeight : 0;

            return (
              <View key={year} style={styles.barColumn}>
                <View style={[styles.barWrapper, { height: BAR_MAX_HEIGHT }]}>
                  <View style={{ height: BAR_MAX_HEIGHT - barHeight }} />
                  <View style={styles.stackedBar}>
                    {pastPeak > 0 && (
                      <View
                        style={[
                          styles.segment,
                          { height: pastH, backgroundColor: PAST_PEAK_COLOR },
                        ]}
                      />
                    )}
                    {tooYoung > 0 && (
                      <View
                        style={[
                          styles.segment,
                          { height: youngH, backgroundColor: TOO_YOUNG_COLOR },
                        ]}
                      />
                    )}
                    {ready > 0 && (
                      <View
                        style={[
                          styles.segment,
                          { height: readyH, backgroundColor: READY_COLOR },
                        ]}
                      />
                    )}
                  </View>
                </View>
                <Text style={styles.yearLabel}>{String(year).slice(2)}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: READY_COLOR }]}
            />
            <Text style={styles.legendText}>Ready</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: TOO_YOUNG_COLOR }]}
            />
            <Text style={styles.legendText}>Too Young</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: PAST_PEAK_COLOR }]}
            />
            <Text style={styles.legendText}>Past Peak</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    paddingBottom: 4,
  },
  barColumn: {
    alignItems: "center",
    width: 28,
  },
  barWrapper: {
    width: 22,
    justifyContent: "flex-end",
  },
  stackedBar: {
    width: 22,
    overflow: "hidden",
    borderRadius: 2,
  },
  segment: {
    width: "100%",
  },
  yearLabel: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  legend: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
});
