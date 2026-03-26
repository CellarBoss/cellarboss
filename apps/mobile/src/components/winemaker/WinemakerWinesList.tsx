import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme, shadows } from "@/lib/theme";
import { WINE_TYPE_COLORS } from "@/lib/constants/wines";

export function WinemakerWinesList({ winemakerId }: { winemakerId: number }) {
  const router = useRouter();

  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });

  const result = queryGate([wineQuery]);
  if (!result.ready) return result.gate;

  const [wines] = result.data;
  const filtered = wines
    .filter((w) => w.wineMakerId === winemakerId)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <View style={styles.section}>
      <Text variant="titleSmall" style={styles.heading}>
        Wines
      </Text>
      <View style={styles.card}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No wines yet</Text>
        ) : (
          filtered.map((wine, index) => {
            const isLast = index === filtered.length - 1;

            return (
              <Pressable
                key={wine.id}
                style={[styles.row, isLast && styles.rowLast]}
                onPress={() => router.push(`/wines/${wine.id}`)}
              >
                <Icon
                  source="bottle-wine"
                  size={20}
                  color={WINE_TYPE_COLORS[wine.type]}
                />
                <Text style={styles.wineName} numberOfLines={1}>
                  {wine.name}
                </Text>
                <Icon
                  source="chevron-right"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                />
              </Pressable>
            );
          })
        )}
      </View>
      <Pressable
        style={styles.addLink}
        onPress={() => router.push(`/wines/new?wineMakerId=${winemakerId}`)}
      >
        <Icon source="plus" size={16} color={theme.colors.primary} />
        <Text style={styles.addText}>Add wine</Text>
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
    gap: 10,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  wineName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  wineType: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textTransform: "capitalize",
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
