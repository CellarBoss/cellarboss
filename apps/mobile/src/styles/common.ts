import { StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";

export function useCommonStyles() {
  const theme = useAppTheme();
  return StyleSheet.create({
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flex: {
      flex: 1,
    },
    detailScrollContent: {
      padding: 16,
    },
    listItem: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    listItemRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    listItemTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    listItemSub: {
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    countBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    countBadgeText: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.onSurfaceVariant,
    },
  });
}
