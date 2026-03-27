import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme, shadows } from "@/lib/theme";
import { WINE_TYPE_COLORS } from "@/lib/constants/wines";

export function GrapeWinesList({ grapeId }: { grapeId: number }) {
  const router = useRouter();

  const winegrapesQuery = useApiQuery({
    queryKey: ["winegrapes"],
    queryFn: () => api.winegrapes.getAll(),
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });

  const result = queryGate([winegrapesQuery, wineQuery, winemakerQuery]);
  if (!result.ready) return result.gate;

  const [winegrapes, wines, winemakers] = result.data;

  const wineIds = new Set(
    winegrapes.filter((wg) => wg.grapeId === grapeId).map((wg) => wg.wineId),
  );
  const filtered = wines
    .filter((w) => wineIds.has(w.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm.name]));

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
            const winemakerName = winemakerMap.get(wine.wineMakerId);

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
                <View style={styles.wineInfo}>
                  <Text style={styles.wineName} numberOfLines={1}>
                    {wine.name}
                  </Text>
                  {winemakerName && (
                    <Text style={styles.winemakerName} numberOfLines={1}>
                      {winemakerName}
                    </Text>
                  )}
                </View>
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
  wineInfo: {
    flex: 1,
    gap: 2,
  },
  wineName: {
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  winemakerName: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
});
