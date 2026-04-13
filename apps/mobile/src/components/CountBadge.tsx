import { View } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useCommonStyles } from "@/styles/common";
import { useAppTheme } from "@/hooks/use-app-theme";

type CountBadgeProps = {
  icon: string;
  count: number;
};

export function CountBadge({ icon, count }: CountBadgeProps) {
  const commonStyles = useCommonStyles();
  const theme = useAppTheme();

  return (
    <View style={commonStyles.countBadge}>
      <Icon source={icon} size={14} color={theme.colors.onSurfaceVariant} />
      <Text style={commonStyles.countBadgeText}>{count}</Text>
    </View>
  );
}
