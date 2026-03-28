import { useState, useCallback } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { AddFAB } from "@/components/AddFAB";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSetting } from "@/hooks/use-settings";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatDateTime } from "@/lib/functions/format";
import { theme } from "@/lib/theme";
import type { TastingNote, Vintage, Wine } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Date (Newest)", value: "date-desc" },
  { label: "Date (Oldest)", value: "date-asc" },
  { label: "Score (High)", value: "score-desc" },
  { label: "Score (Low)", value: "score-asc" },
];

function getScoreColor(score: number): string {
  if (score >= 9) return "#2e7d32";
  if (score >= 7) return "#558b2f";
  if (score >= 5) return "#f9a825";
  if (score >= 3) return "#ef6c00";
  return "#c62828";
}

export default function TastingNotesScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentSort, setCurrentSort] = useState("date-desc");
  const [deleteTarget, setDeleteTarget] = useState<TastingNote | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: datetimeFormat } = useSetting("datetime");

  const notesQuery = useApiQuery({
    queryKey: ["tastingNotes"],
    queryFn: () => api.tastingNotes.getAll(),
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
    notesQuery,
    vintageQuery,
    wineQuery,
    winemakerQuery,
  ]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.tastingNotes.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tastingNotes"] });
      setDeleteTarget(null);
    },
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["tastingNotes"] });
    setRefreshing(false);
  }, [queryClient]);

  if (!result.ready) return result.gate;

  const [notes, vintages, wines, winemakers] = result.data;

  const vintageMap = new Map(vintages.map((v) => [v.id, v]));
  const wineMap = new Map(wines.map((w) => [w.id, w]));
  const winemakerMap = new Map(winemakers.map((wm) => [wm.id, wm.name]));

  function getWineContext(note: TastingNote) {
    const vintage = vintageMap.get(note.vintageId);
    if (!vintage) return { wineTitle: "Unknown", winemakerName: "" };
    const wine = wineMap.get(vintage.wineId);
    const year = vintage.year ? String(vintage.year) : "NV";
    return {
      wineTitle: wine ? `${wine.name} ${year}` : `Unknown ${year}`,
      winemakerName: wine ? (winemakerMap.get(wine.wineMakerId) ?? "") : "",
    };
  }

  const sortedNotes = [...notes].sort((a, b) => {
    switch (currentSort) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "score-desc":
        return b.score - a.score;
      case "score-asc":
        return a.score - b.score;
      default:
        return 0;
    }
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Tasting Notes" showBack />
      <View style={styles.content}>
        <DataList
          data={sortedNotes}
          keyExtractor={(item) => String(item.id)}
          searchPlaceholder="Search tasting notes..."
          searchFilter={(item, query) => {
            const lower = query.toLowerCase();
            const ctx = getWineContext(item);
            return (
              ctx.wineTitle.toLowerCase().includes(lower) ||
              ctx.winemakerName.toLowerCase().includes(lower) ||
              item.author.toLowerCase().includes(lower) ||
              item.notes.toLowerCase().includes(lower)
            );
          }}
          sortOptions={SORT_OPTIONS}
          onSort={setCurrentSort}
          currentSort={currentSort}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          emptyIcon="note-text-outline"
          emptyTitle="No tasting notes yet"
          emptyMessage="Add your first tasting note to get started"
          emptyActionLabel="Add Tasting Note"
          onEmptyAction={() => router.push("/tasting-notes/new")}
          swipeActions={(note) => [
            {
              icon: "pencil",
              color: theme.colors.primary,
              onPress: () => router.push(`/tasting-notes/${note.id}/edit`),
            },
            {
              icon: "delete",
              color: "#dc2626",
              onPress: () => setDeleteTarget(note),
            },
          ]}
          renderItem={(note) => (
            <TastingNoteListItem
              note={note}
              wineContext={getWineContext(note)}
              datetimeFormat={datetimeFormat}
              onPress={() => router.push(`/tasting-notes/${note.id}`)}
            />
          )}
        />
      </View>

      <AddFAB onPress={() => router.push("/tasting-notes/new")} />

      <ConfirmDialog
        visible={deleteTarget !== null}
        title="Delete Tasting Note"
        message={
          deleteTarget
            ? `Delete tasting note by ${deleteTarget.author}? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}

type TastingNoteListItemProps = {
  note: TastingNote;
  wineContext: { wineTitle: string; winemakerName: string };
  datetimeFormat?: string | number | boolean | null;
  onPress: () => void;
};

function TastingNoteListItem({
  note,
  wineContext,
  datetimeFormat,
  onPress,
}: TastingNoteListItemProps) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View
        style={[
          styles.scoreBadge,
          { backgroundColor: getScoreColor(note.score) },
        ]}
      >
        <Text style={styles.scoreText}>{note.score}</Text>
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {wineContext.wineTitle}
          </Text>
          {!!wineContext.winemakerName && (
            <Text style={styles.winemakerLabel} numberOfLines={1}>
              {wineContext.winemakerName}
            </Text>
          )}
        </View>
        {!!note.notes && (
          <Text style={styles.itemSub} numberOfLines={2}>
            {note.notes}
          </Text>
        )}
        <View style={styles.itemMeta}>
          <Text style={styles.metaText}>{note.author}</Text>
          <Text style={styles.metaText}>
            {typeof datetimeFormat === "string"
              ? formatDateTime(note.date, datetimeFormat)
              : note.date.split("T")[0]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  item: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  scoreBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  winemakerLabel: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
});
