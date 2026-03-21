import { View, Pressable, StyleSheet } from "react-native";
import { Text, Chip } from "react-native-paper";
import { getStatusColor } from "@/lib/constants/bottles";
import { formatStatus } from "@/lib/functions/format";
import { formatPrice } from "@/lib/functions/format";
import { theme } from "@/lib/theme";
import type { Bottle } from "@cellarboss/types";

type BottleListItemProps = {
  bottle: Bottle;
  wineName: string;
  wineYear: string;
  winemakerName: string;
  storageName: string;
  currency: string;
  onPress: () => void;
};

export function BottleListItem({
  bottle,
  wineName,
  wineYear,
  winemakerName,
  storageName,
  currency,
  onPress,
}: BottleListItemProps) {
  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemTop}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {wineName} {wineYear}
        </Text>
        <Chip
          style={[
            styles.statusChip,
            { backgroundColor: getStatusColor(bottle.status) },
          ]}
          textStyle={styles.statusChipText}
          compact
        >
          {formatStatus(bottle.status)}
        </Chip>
      </View>
      <Text style={styles.itemSub} numberOfLines={1}>
        {winemakerName}
        {winemakerName ? " · " : ""}
        {storageName} · {formatPrice(bottle.purchasePrice, currency)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
  },
  itemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: theme.colors.onSurface,
  },
  statusChip: {
    height: 30,
  },
  statusChipText: {
    color: "#fff",
    fontSize: 11,
    lineHeight: 14,
  },
  itemSub: {
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
  },
});
