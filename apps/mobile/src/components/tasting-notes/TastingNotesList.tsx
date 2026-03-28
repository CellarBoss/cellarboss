import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useRouter } from "expo-router";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { queryGate } from "@/lib/functions/query-gate";
import { formatDateTime } from "@/lib/functions/format";
import { theme, shadows } from "@/lib/theme";
import { TastingNote, Vintage, Wine } from "@cellarboss/types";

export function WineTastingNotesList({ wine }: { wine: Wine }) {
  const notesQuery = useApiQuery({
    queryKey: ["tasting-notes", "wine", wine.id],
    queryFn: () => api.tastingNotes.getByWineId(wine.id),
  });

  const result = queryGate([notesQuery]);
  if (!result.ready) return result.gate;

  return <TastingNotesList notes={result.data[0]} />;
}

export function VintageTastingNotesList({ vintage }: { vintage: Vintage }) {
  const notesQuery = useApiQuery({
    queryKey: ["tasting-notes", "vintage", vintage.id],
    queryFn: () => api.tastingNotes.getByVintageId(vintage.id),
  });

  const result = queryGate([notesQuery]);
  if (!result.ready) return result.gate;

  return <TastingNotesList notes={result.data[0]} vintageId={vintage.id} />;
}

function getScoreColor(score: number): string {
  if (score >= 9) return "#2e7d32";
  if (score >= 7) return "#558b2f";
  if (score >= 5) return "#f9a825";
  if (score >= 3) return "#ef6c00";
  return "#c62828";
}

function TastingNotesList({
  notes,
  vintageId,
}: {
  notes: TastingNote[];
  vintageId?: number;
}) {
  const router = useRouter();

  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date));

  const newNoteHref = vintageId
    ? `/tasting-notes/new?vintageId=${vintageId}`
    : "/tasting-notes/new";

  return (
    <View style={styles.section}>
      <Text variant="titleSmall" style={styles.heading}>
        Tasting Notes
      </Text>
      <View style={styles.card}>
        {sorted.length === 0 ? (
          <Text style={styles.empty}>No notes yet</Text>
        ) : (
          sorted.map((note, index) => {
            const isLast = index === sorted.length - 1;

            return (
              <Pressable
                key={note.id}
                style={[styles.row, isLast && styles.rowLast]}
                onPress={() => router.push(`/tasting-notes/${note.id}`)}
              >
                <View
                  style={[
                    styles.scoreBadge,
                    { backgroundColor: getScoreColor(note.score) },
                  ]}
                >
                  <Text style={styles.scoreText}>{note.score}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.noteText}>
                    {note.notes || "No notes"}
                  </Text>
                  <Text style={styles.author}>{note.author}</Text>
                </View>
                <Text style={styles.date}>
                  {formatDateTime(note.date, "dd MMM yyyy")}
                </Text>
              </Pressable>
            );
          })
        )}
      </View>
      <Pressable
        style={styles.addLink}
        onPress={() => router.push(newNoteHref)}
      >
        <Icon source="plus" size={16} color={theme.colors.primary} />
        <Text style={styles.addText}>Add tasting note</Text>
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
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  scoreBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginRight: 12,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "bold" as const,
    color: "#fff",
  },
  rowContent: {
    flex: 1,
    flexShrink: 1,
    gap: 2,
  },
  noteText: {
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  author: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  date: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginLeft: 12,
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
