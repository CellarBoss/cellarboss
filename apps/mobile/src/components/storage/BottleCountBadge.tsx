import { View, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-paper";
import { useAppTheme } from "@/hooks/use-app-theme";

export function BottleCountBadge({ count }: { count: number }) {
  const theme = useAppTheme();

  if (count === 0) return null;

  const styles = StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      gap: 4,
    },
    text: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.colors.onSurfaceVariant,
    },
  });

  return (
    <View style={styles.badge}>
      <Icon
        source="bottle-wine"
        size={14}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={styles.text}>{count}</Text>
    </View>
  );
}
