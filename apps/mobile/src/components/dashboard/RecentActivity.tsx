import { View, StyleSheet } from "react-native";
import { Card, Text, Icon } from "react-native-paper";
import { parseISO, formatDistanceToNow, subDays } from "date-fns";
import type {
  Bottle,
  TastingNote,
  Vintage,
  Wine,
  WineMaker,
} from "@cellarboss/types";
import { theme } from "@/lib/theme";

type RecentActivityProps = {
  bottles: Bottle[];
  tastingNotes: TastingNote[];
  vintages: Vintage[];
  wines: Wine[];
  winemakers: WineMaker[];
};

type ActivityItem = {
  id: string;
  type: "purchase" | "tasting";
  date: Date;
  wineName: string;
  year: number | null;
  winemakerName: string;
  detail: string;
};

export function RecentActivity({
  bottles,
  tastingNotes,
  vintages,
  wines,
  winemakers,
}: RecentActivityProps) {
  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm]));

  const cutoff = subDays(new Date(), 30);
  const activities: ActivityItem[] = [];

  for (const bottle of bottles) {
    if (!bottle.purchaseDate) continue;
    let date: Date;
    try {
      date = parseISO(bottle.purchaseDate);
    } catch {
      continue;
    }
    if (date < cutoff) continue;

    const vintage = vintageMap.get(bottle.vintageId);
    const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
    const winemaker = wine ? winemakerMap.get(wine.wineMakerId) : undefined;

    activities.push({
      id: `bottle-${bottle.id}`,
      type: "purchase",
      date,
      wineName: wine?.name ?? "Unknown Wine",
      year: vintage?.year ?? null,
      winemakerName: winemaker?.name ?? "",
      detail: `Purchased`,
    });
  }

  for (const note of tastingNotes) {
    if (!note.date) continue;
    let date: Date;
    try {
      date = parseISO(note.date);
    } catch {
      continue;
    }
    if (date < cutoff) continue;

    const vintage = vintageMap.get(note.vintageId);
    const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
    const winemaker = wine ? winemakerMap.get(wine.wineMakerId) : undefined;

    activities.push({
      id: `note-${note.id}`,
      type: "tasting",
      date,
      wineName: wine?.name ?? "Unknown Wine",
      year: vintage?.year ?? null,
      winemakerName: winemaker?.name ?? "",
      detail: `Tasted · ${note.score}/10`,
    });
  }

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recent = activities.slice(0, 8);

  if (recent.length === 0) {
    return (
      <Card style={styles.card}>
        <Card.Title title="Recent Activity" />
        <Card.Content>
          <Text style={styles.empty}>No activity in the last 30 days</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Title title="Recent Activity" />
      <Card.Content style={styles.content}>
        {recent.map((item) => (
          <View key={item.id} style={styles.row}>
            <View
              style={[
                styles.iconWrapper,
                item.type === "purchase"
                  ? styles.iconPurchase
                  : styles.iconTasting,
              ]}
            >
              <Icon
                source={
                  item.type === "purchase" ? "bottle-wine" : "star-outline"
                }
                size={16}
                color={
                  item.type === "purchase" ? theme.colors.primary : "#DAA520"
                }
              />
            </View>
            <View style={styles.details}>
              <Text style={styles.wineName} numberOfLines={1}>
                {item.wineName}
                {item.year ? ` ${item.year}` : ""}
              </Text>
              <Text style={styles.detail} numberOfLines={1}>
                {item.winemakerName ? `${item.winemakerName} · ` : ""}
                {item.detail}
              </Text>
            </View>
            <Text style={styles.time}>
              {formatDistanceToNow(item.date, { addSuffix: true })}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
  },
  content: {
    gap: 12,
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
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPurchase: {
    backgroundColor: theme.colors.primaryContainer,
  },
  iconTasting: {
    backgroundColor: "#FEF3C7",
  },
  details: {
    flex: 1,
  },
  wineName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  detail: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  time: {
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    textAlign: "right",
    maxWidth: 72,
  },
});
