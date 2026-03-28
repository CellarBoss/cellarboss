import { View, Pressable, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { commonStyles } from "@/styles/common";
import { theme } from "@/lib/theme";
import { WINE_TYPE_COLORS } from "@/lib/constants/wines";
import type { Wine } from "@cellarboss/types";

type WineListItemProps = {
  wine: Wine;
  winemakerName: string;
  regionDisplay: string;
  onPress: () => void;
};

export function WineListItem({
  wine,
  winemakerName,
  regionDisplay,
  onPress,
}: WineListItemProps) {
  return (
    <Pressable
      testID={`wine-item-${wine.id}`}
      style={commonStyles.listItem}
      onPress={onPress}
    >
      <View style={[commonStyles.listItemRow, styles.row]}>
        <View style={styles.text}>
          <Text
            style={[commonStyles.listItemTitle, styles.title]}
            numberOfLines={1}
          >
            {wine.name}
          </Text>
          {!!winemakerName && (
            <View style={styles.detailRow}>
              <Icon
                source="account"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                {winemakerName}
              </Text>
            </View>
          )}
          {!!regionDisplay && (
            <View style={styles.detailRow}>
              <Icon
                source="earth"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                {regionDisplay}
              </Text>
            </View>
          )}
        </View>
        <Icon
          source="bottle-wine"
          size={40}
          color={WINE_TYPE_COLORS[wine.type]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    flex: 1,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    flex: 1,
    color: theme.colors.onSurfaceVariant,
  },
});
