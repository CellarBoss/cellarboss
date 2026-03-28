import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { theme, shadows } from "@/lib/theme";
import { BottleCountBadge } from "@/components/storage/BottleCountBadge";

export function LocationStoragesList({ locationId }: { locationId: number }) {
  const router = useRouter();

  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: () => api.storages.getAll(),
  });
  const bottlesQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: () => api.bottles.getAll(),
  });

  const result = queryGate([storagesQuery, bottlesQuery]);
  if (!result.ready) return result.gate;

  const [storages, bottles] = result.data;

  const bottleCountByStorage = new Map<number, number>();
  for (const bottle of bottles) {
    if (bottle.status === "stored" && bottle.storageId != null) {
      bottleCountByStorage.set(
        bottle.storageId,
        (bottleCountByStorage.get(bottle.storageId) ?? 0) + 1,
      );
    }
  }

  const filtered = storages
    .filter((s) => s.locationId === locationId && s.parent == null)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <View style={styles.section}>
      <Text variant="titleSmall" style={styles.heading}>
        Storages
      </Text>
      <View style={styles.card}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No storages yet</Text>
        ) : (
          filtered.map((storage, index) => {
            const isLast = index === filtered.length - 1;
            const bottleCount = bottleCountByStorage.get(storage.id) ?? 0;

            return (
              <Pressable
                key={storage.id}
                style={[styles.row, isLast && styles.rowLast]}
                onPress={() => router.push(`/storages/${storage.id}`)}
              >
                <Icon
                  source="warehouse"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.storageName} numberOfLines={1}>
                  {storage.name}
                </Text>
                <BottleCountBadge count={bottleCount} />
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
        onPress={() => router.push(`/storages/new?locationId=${locationId}`)}
      >
        <Icon source="plus" size={16} color={theme.colors.primary} />
        <Text style={styles.addText}>Add storage</Text>
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
  storageName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
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
