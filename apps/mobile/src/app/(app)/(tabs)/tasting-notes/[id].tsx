import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { FormCard } from "@/components/FormCard";
import { WineGlassRating } from "@/components/WineGlassRating";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSetting } from "@/hooks/use-settings";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatDateTime } from "@/lib/functions/format";
import { theme } from "@/lib/theme";
import { tastingNoteEditFields } from "@/lib/fields/tasting-notes";
import type { Vintage, Wine } from "@cellarboss/types";

export default function ViewTastingNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: datetimeFormat } = useSetting("datetime");

  const noteQuery = useApiQuery({
    queryKey: ["tastingNotes", Number(id)],
    queryFn: () => api.tastingNotes.getById(Number(id)),
  });
  const vintageQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: () => api.vintages.getAll(),
  });
  const wineQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: () => api.wines.getAll(),
  });

  const result = queryGate([noteQuery, vintageQuery, wineQuery]);
  if (!result.ready) return result.gate;

  const [note, vintages, wines] = result.data;

  const vintageMap = new Map(vintages.map((v: Vintage) => [v.id, v]));
  const wineMap = new Map(wines.map((w: Wine) => [w.id, w]));
  const vintage = vintageMap.get(note.vintageId);
  const wine = vintage ? wineMap.get(vintage.wineId) : undefined;

  const title = wine ? `${wine.name} ${vintage?.year ?? "NV"}` : "Tasting Note";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader
        title={title}
        showBack
        actions={[
          {
            icon: "pencil",
            onPress: () => router.push(`/tasting-notes/${id}/edit`),
          },
        ]}
      />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.authorText}>{note.author}</Text>
          <Text style={styles.dateText}>
            {typeof datetimeFormat === "string"
              ? formatDateTime(note.date, datetimeFormat)
              : note.date.split("T")[0]}
          </Text>
        </View>
        <WineGlassRating value={note.score} />
      </View>
      <FormCard mode="view" data={note} fields={tastingNoteEditFields} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    alignItems: "center",
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  authorText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurface,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
});
