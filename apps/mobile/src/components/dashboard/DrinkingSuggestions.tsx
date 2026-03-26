import { View, StyleSheet, Pressable } from "react-native";
import { Card, Text } from "react-native-paper";
import type { Bottle, Vintage, Wine, WineMaker } from "@cellarboss/types";
import { theme } from "@/lib/theme";
import { useRouter } from "expo-router";

type DrinkingSuggestionsProps = {
  bottles: Bottle[];
  vintages: Vintage[];
  wines: Wine[];
  winemakers: WineMaker[];
};

export function DrinkingSuggestions({
  bottles,
  vintages,
  wines,
  winemakers,
}: DrinkingSuggestionsProps) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm]));

  const storedBottles = bottles.filter((b) => b.status === "stored");

  // Group by vintageId for bottles that are at or near peak (drinkUntil <= currentYear + 2)
  const urgentVintageMap = new Map<
    number,
    { count: number; drinkUntil: number }
  >();

  for (const bottle of storedBottles) {
    const vintage = vintageMap.get(bottle.vintageId);
    if (!vintage || vintage.drinkUntil === null) continue;
    if (vintage.drinkUntil <= currentYear + 2) {
      const existing = urgentVintageMap.get(bottle.vintageId);
      if (existing) {
        existing.count++;
      } else {
        urgentVintageMap.set(bottle.vintageId, {
          count: 1,
          drinkUntil: vintage.drinkUntil,
        });
      }
    }
  }

  const suggestions = Array.from(urgentVintageMap.entries())
    .map(([vintageId, { count, drinkUntil }]) => ({
      vintageId,
      count,
      drinkUntil,
    }))
    .sort((a, b) => a.drinkUntil - b.drinkUntil)
    .slice(0, 8);

  if (suggestions.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Title title="Drink Soon" />
        <Card.Content>
          <Text style={styles.empty}>No urgent bottles at the moment</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="Drink Soon" />
      <Card.Content style={styles.content}>
        {suggestions.map(({ vintageId, count, drinkUntil }) => {
          const vintage = vintageMap.get(vintageId);
          const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
          const winemaker = wine
            ? winemakerMap.get(wine.wineMakerId)
            : undefined;

          const wineName = wine?.name ?? "Unknown Wine";
          const year = vintage?.year ? ` ${vintage.year}` : "";
          const winemakerName = winemaker?.name ?? "";
          const isPastPeak = drinkUntil < currentYear;

          return (
            <Pressable
              key={vintageId}
              style={styles.card}
              onPress={() => router.push(`/vintages/${vintageId}`)}
            >
              <View style={styles.row}>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
                <View style={styles.details}>
                  <Text style={styles.wineName} numberOfLines={1}>
                    {wineName}
                    {year}
                  </Text>
                  {winemakerName ? (
                    <Text style={styles.winemaker} numberOfLines={1}>
                      {winemakerName}
                    </Text>
                  ) : null}
                </View>
                <View
                  style={[
                    styles.deadlineBadge,
                    isPastPeak && styles.deadlineBadgePast,
                  ]}
                >
                  <Text
                    style={[
                      styles.deadlineText,
                      isPastPeak && styles.deadlineTextPast,
                    ]}
                  >
                    By {drinkUntil}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
  },
  content: {
    gap: 10,
  },
  empty: {
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    paddingVertical: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  countBadge: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: 12,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.onPrimaryContainer,
  },
  details: {
    flex: 1,
  },
  wineName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  winemaker: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  deadlineBadge: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  deadlineBadgePast: {
    backgroundColor: theme.colors.errorContainer,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#92400E",
  },
  deadlineTextPast: {
    color: theme.colors.onErrorContainer,
  },
});
