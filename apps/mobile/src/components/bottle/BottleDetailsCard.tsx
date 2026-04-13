import { View, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { shadows } from "@/lib/theme";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useSetting } from "@/hooks/use-settings";
import {
  formatStatus,
  formatBottleSize,
  formatPrice,
  formatDate,
} from "@/lib/functions/format";
import { getStatusColor, BOTTLE_STATUS_ICONS } from "@/lib/constants/bottles";
import type { Bottle } from "@cellarboss/types";
import type { BottleStatus } from "@cellarboss/validators/constants";

export function BottleDetailsCard({ bottle }: { bottle: Bottle }) {
  const theme = useAppTheme();
  const currencySetting = useSetting("currency");
  const dateFormatSetting = useSetting("dateFormat");
  const currency = (currencySetting.data as string) || "USD";
  const dateFormat = (dateFormatSetting.data as string) || "dd/MM/yyyy";

  const statusIcon =
    BOTTLE_STATUS_ICONS[bottle.status as BottleStatus] ?? "help-circle";

  const styles = StyleSheet.create({
    heading: {
      color: theme.colors.onSurface,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      ...shadows.card,
    },
    infoGrid: {
      gap: 10,
    },
    infoItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 6,
    },
    detailText: {
      flex: 1,
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <>
      <Text variant="titleSmall" style={styles.heading}>
        Bottle
      </Text>
      <View style={styles.card}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Icon
              source={statusIcon}
              size={16}
              color={getStatusColor(bottle.status)}
            />
            <Text variant="bodyMedium" style={styles.detailText}>
              {formatStatus(bottle.status)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon
              source="resize"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={styles.detailText}>
              {formatBottleSize(bottle.size)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon
              source="calendar"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={styles.detailText}>
              {formatDate(bottle.purchaseDate, dateFormat)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Icon
              source="cash"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text variant="bodyMedium" style={styles.detailText}>
              {formatPrice(bottle.purchasePrice, currency)}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}
