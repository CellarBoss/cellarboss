import { ScrollView, View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useCommonStyles } from "@/styles/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenHeader } from "@/components/ScreenHeader";
import { WineGlassRating } from "@/components/form/WineGlassRating";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSetting } from "@/hooks/use-settings";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatDateTime } from "@/lib/functions/format";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { Vintage, Wine } from "@cellarboss/types";

export default function ViewTastingNoteScreen() {
  const commonStyles = useCommonStyles();
  const theme = useAppTheme();
  const styles = StyleSheet.create({
    sectionHeading: {
      color: theme.colors.onSurface,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    sectionHeadingSpaced: {
      marginTop: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      ...shadows.card,
      overflow: "hidden",
    },
    wineRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 10,
    },
    wineInfo: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    wineName: {
      flex: 1,
      fontSize: 15,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    winemakerLabel: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.outlineVariant,
      marginHorizontal: 16,
    },
    metaRow: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    metaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    ratingRow: {
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    notesText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.colors.onSurface,
      padding: 16,
    },
  });
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
  const winemakerQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: () => api.winemakers.getAll(),
  });

  const result = queryGate([
    noteQuery,
    vintageQuery,
    wineQuery,
    winemakerQuery,
  ]);
  if (!result.ready) return result.gate;

  const [note, vintages, wines, winemakers] = result.data;

  const vintageMap = new Map(vintages.map((v: Vintage) => [v.id, v]));
  const wineMap = new Map(wines.map((w: Wine) => [w.id, w]));
  const vintage = vintageMap.get(note.vintageId);
  const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
  const winemaker = wine
    ? winemakers.find((wm) => wm.id === wine.wineMakerId)
    : undefined;

  const title = wine ? `${wine.name} ${vintage?.year ?? "NV"}` : "Tasting Note";
  const dateDisplay =
    typeof datetimeFormat === "string"
      ? formatDateTime(note.date, datetimeFormat)
      : note.date.split("T")[0];

  return (
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
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
      <ScrollView contentContainerStyle={commonStyles.detailScrollContent}>
        {/* Details card */}
        <Text variant="titleSmall" style={styles.sectionHeading}>
          Details
        </Text>
        <View style={styles.card}>
          {wine && vintage && (
            <Pressable
              style={styles.wineRow}
              onPress={() => router.push(`/vintages/${vintage.id}`)}
            >
              <Icon
                source="bottle-wine"
                size={20}
                color={theme.colors.primary}
              />
              <View style={styles.wineInfo}>
                <Text style={styles.wineName} numberOfLines={1}>
                  {wine.name} {vintage.year ?? "NV"}
                </Text>
                {winemaker && (
                  <Text style={styles.winemakerLabel} numberOfLines={1}>
                    {winemaker.name}
                  </Text>
                )}
              </View>
              <Icon
                source="chevron-right"
                size={20}
                color={theme.colors.onSurfaceVariant}
              />
            </Pressable>
          )}
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Icon
                source="account-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.metaText}>{note.author}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon
                source="calendar-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.metaText}>{dateDisplay}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.ratingRow}>
            <WineGlassRating value={note.score} />
          </View>
        </View>

        {/* Notes card */}
        <Text
          variant="titleSmall"
          style={[styles.sectionHeading, styles.sectionHeadingSpaced]}
        >
          Notes
        </Text>
        <View style={styles.card}>
          <Text style={styles.notesText}>
            {note.notes || "No tasting notes recorded."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
