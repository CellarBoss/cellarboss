import { View } from "react-native";
import { Text, Icon } from "react-native-paper";
import { commonStyles } from "@/styles/common";
import { theme } from "@/lib/theme";

type CountBadgeProps = {
  icon: string;
  count: number;
};

export function CountBadge({ icon, count }: CountBadgeProps) {
  return (
    <View style={commonStyles.countBadge}>
      <Icon source={icon} size={14} color={theme.colors.onSurfaceVariant} />
      <Text style={commonStyles.countBadgeText}>{count}</Text>
    </View>
  );
}
