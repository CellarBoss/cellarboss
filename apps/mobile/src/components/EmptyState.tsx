import { View, StyleSheet } from "react-native";
import { Text, Button, Icon } from "react-native-paper";
import { theme } from "@/lib/theme";

type EmptyStateProps = {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = "inbox-outline",
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={theme.colors.outlineVariant} />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {actionLabel && onAction && (
        <Button
          testID="empty-action-button"
          mode="contained"
          onPress={onAction}
          style={styles.button}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.onBackground,
    marginTop: 8,
  },
  message: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
  },
  button: {
    marginTop: 12,
  },
});
