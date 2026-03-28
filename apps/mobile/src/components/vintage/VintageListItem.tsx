import { View, Pressable, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { commonStyles } from "@/styles/common";
import {
  formatDrinkingWindow,
  formatDrinkingStatus,
  type DrinkingStatus,
} from "@/lib/functions/format";
import { theme } from "@/lib/theme";
import type { Vintage } from "@cellarboss/types";

const STATUS_COLORS: Record<DrinkingStatus, string> = {
  drinkable: "#16a34a",
  wait: "#ca8a04",
  past: "#dc2626",
  unknown: theme.colors.onSurfaceVariant,
};

type VintageListItemProps = {
  vintage: Vintage;
  wineName: string;
  currentYear: number;
  onPress: () => void;
};

export function VintageListItem({
  vintage,
  wineName,
  currentYear,
  onPress,
}: VintageListItemProps) {
  const drinkingWindow = formatDrinkingWindow(
    vintage.drinkFrom,
    vintage.drinkUntil,
  );
  const status = formatDrinkingStatus(
    vintage.drinkFrom,
    vintage.drinkUntil,
    currentYear,
  );

  return (
    <Pressable style={commonStyles.listItem} onPress={onPress}>
      <View style={styles.top}>
        <Text
          style={[commonStyles.listItemTitle, styles.title]}
          numberOfLines={1}
        >
          {wineName}
        </Text>
        <Text style={styles.yearLabel}>
          {vintage.year !== null ? vintage.year : "NV"}
        </Text>
      </View>
      <Text
        style={[commonStyles.listItemSub, { color: STATUS_COLORS[status] }]}
        numberOfLines={1}
      >
        {drinkingWindow}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  title: {
    flex: 1,
  },
  yearLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.onSurfaceVariant,
  },
});
