import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { commonStyles } from "@/styles/common";
import { formatDateTime } from "@/lib/functions/format";
import { theme } from "@/lib/theme";
import { scoreColor } from "@cellarboss/common";
import type { TastingNote } from "@cellarboss/types";

type TastingNoteListItemProps = {
  note: TastingNote;
  wineContext: { wineTitle: string; winemakerName: string };
  datetimeFormat?: string | number | boolean | null;
  onPress: () => void;
};

export function TastingNoteListItem({
  note,
  wineContext,
  datetimeFormat,
  onPress,
}: TastingNoteListItemProps) {
  return (
    <Pressable style={[commonStyles.listItem, styles.item]} onPress={onPress}>
      <View
        style={[styles.scoreBadge, { backgroundColor: scoreColor(note.score) }]}
      >
        <Text style={styles.scoreText}>{note.score}</Text>
      </View>
      <View style={styles.content}>
        <View style={[commonStyles.listItemRow, styles.top]}>
          <Text
            style={[commonStyles.listItemTitle, styles.title]}
            numberOfLines={1}
          >
            {wineContext.wineTitle}
          </Text>
          {!!wineContext.winemakerName && (
            <Text style={commonStyles.listItemSub} numberOfLines={1}>
              {wineContext.winemakerName}
            </Text>
          )}
        </View>
        {!!note.notes && (
          <Text style={styles.notesSub} numberOfLines={2}>
            {note.notes}
          </Text>
        )}
        <View style={styles.meta}>
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
  item: {
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
  content: {
    flex: 1,
    gap: 3,
  },
  top: {
    gap: 8,
  },
  title: {
    flex: 1,
  },
  notesSub: {
    fontSize: 13,
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
});
