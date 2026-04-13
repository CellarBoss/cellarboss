import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import type { Storage } from "@cellarboss/types";

export function StorageDetailsCard({ storageId }: { storageId: number }) {
  const theme = useAppTheme();
  const router = useRouter();

  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: () => api.storages.getAll(),
  });
  const locationsQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: () => api.locations.getAll(),
  });

  const result = queryGate([storagesQuery, locationsQuery]);
  if (!result.ready) return result.gate;

  const [storages, locations] = result.data;

  const storageMap = new Map(storages.map((s) => [s.id, s]));
  const locationMap = new Map(locations.map((l) => [l.id, l]));
  const storage = storageMap.get(storageId);
  if (!storage) return null;

  const hierarchy: Storage[] = [];
  let current: Storage | undefined = storage;
  while (current?.parent != null) {
    const parent = storageMap.get(current.parent);
    if (parent) {
      hierarchy.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  hierarchy.push(storage);

  const location =
    storage.locationId != null
      ? locationMap.get(storage.locationId)
      : undefined;

  const styles = StyleSheet.create({
    heading: {
      color: theme.colors.onSurface,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      ...shadows.card,
    },
    row: {
      flexDirection: "row" as const,
      alignItems: "flex-start" as const,
      gap: 12,
    },
    details: {
      flex: 1,
      gap: 4,
    },
    detailRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 6,
      marginTop: 2,
    },
    detailText: {
      flex: 1,
      color: theme.colors.onSurfaceVariant,
    },
    hierarchyRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      flexWrap: "wrap" as const,
      marginBottom: 2,
    },
    hierarchySegment: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    hierarchyText: {
      fontSize: 14,
      fontWeight: "bold" as const,
      color: theme.colors.primary,
    },
  });

  return (
    <>
      <Text variant="titleSmall" style={styles.heading}>
        Storage
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.details}>
            <View style={styles.hierarchyRow}>
              {hierarchy.map((s, i) => (
                <View key={s.id} style={styles.hierarchySegment}>
                  {i > 0 && (
                    <Icon
                      source="chevron-right"
                      size={14}
                      color={theme.colors.onSurfaceVariant}
                    />
                  )}
                  <Pressable onPress={() => router.push(`/storages/${s.id}`)}>
                    <Text style={styles.hierarchyText}>{s.name}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
            {location && (
              <View style={styles.detailRow}>
                <Icon
                  source="map-marker"
                  size={16}
                  color={theme.colors.onSurfaceVariant}
                />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {location.name}
                </Text>
              </View>
            )}
          </View>
          <Icon source="warehouse" size={40} color={theme.colors.primary} />
        </View>
      </View>
    </>
  );
}
