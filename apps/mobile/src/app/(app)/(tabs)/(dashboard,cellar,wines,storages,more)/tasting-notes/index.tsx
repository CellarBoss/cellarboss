import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { DataList } from "@/components/DataList";
import { AddFAB } from "@/components/AddFAB";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ScreenHeader } from "@/components/ScreenHeader";
import { TastingNoteListItem } from "@/components/tasting-notes/TastingNoteListItem";
import { useApiQuery } from "@/hooks/use-api-query";
import { useSetting } from "@/hooks/use-settings";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { useCommonStyles } from "@/styles/common";
import { useAppTheme } from "@/hooks/use-app-theme";
import type { TastingNote } from "@cellarboss/types";

const SORT_OPTIONS = [
  { label: "Date (Newest)", value: "date-desc" },
  { label: "Date (Oldest)", value: "date-asc" },
  { label: "Score (High)", value: "score-desc" },
  { label: "Score (Low)", value: "score-asc" },
];

export default function TastingNotesScreen() {
  const commonStyles = useCommonStyles();
  const theme = useAppTheme();
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
    <SafeAreaView style={commonStyles.screenContainer} edges={["top"]}>
      <ScreenHeader title="Tasting Notes" showBack />
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
