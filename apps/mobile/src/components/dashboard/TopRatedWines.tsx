import { View, StyleSheet, Pressable } from "react-native";
import { Card, Text } from "react-native-paper";
import type { TastingNote, Vintage, Wine, WineMaker } from "@cellarboss/types";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/hooks/use-app-theme";

type TopRatedWinesProps = {
  tastingNotes: TastingNote[];
  vintages: Vintage[];
  wines: Wine[];
  winemakers: WineMaker[];
};

export function TopRatedWines({
  tastingNotes,
  vintages,
  wines,
  winemakers,
}: TopRatedWinesProps) {
  const router = useRouter();
  const theme = useAppTheme();

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm]));

  // Average scores by vintage
  const vintageScores = new Map<number, { total: number; count: number }>();
  for (const note of tastingNotes) {
    const existing = vintageScores.get(note.vintageId) ?? {
      total: 0,
      count: 0,
    };
    vintageScores.set(note.vintageId, {
      total: existing.total + note.score,
      count: existing.count + 1,
    });
  }

  const ranked = Array.from(vintageScores.entries())
    .map(([vintageId, { total, count }]) => ({
      vintageId,
      avg: total / count,
      count,
    }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 5);

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
    rank: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.onSurfaceVariant,
      width: 20,
      textAlign: "center",
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
    scoreBadge: {
      backgroundColor: theme.colors.primaryContainer,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      minWidth: 40,
      alignItems: "center",
    },
    scoreText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.onPrimaryContainer,
    },
  });

  if (ranked.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Title title="Top Rated" />
        <Card.Content>
          <Text style={styles.empty}>No tasting notes yet</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="Top Rated" />
      <Card.Content style={styles.content}>
        {ranked.map(({ vintageId, avg, count }, index) => {
          const vintage = vintageMap.get(vintageId);
          const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
          const winemaker = wine
            ? winemakerMap.get(wine.wineMakerId)
            : undefined;

          const wineName = wine?.name ?? "Unknown Wine";
          const year = vintage?.year ? ` ${vintage.year}` : "";
          const winemakerName = winemaker?.name ?? "";

          return (
            <Pressable
              key={vintageId}
              style={styles.card}
              onPress={() => router.push(`/vintages/${vintageId}`)}
            >
              <View style={styles.row}>
                <Text style={styles.rank}>{index + 1}</Text>
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
                <View style={styles.scoreBadge}>
                  <Text style={styles.scoreText}>{avg.toFixed(1)}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </Card.Content>
    </Card>
  );
}
