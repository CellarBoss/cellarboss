import { View, StyleSheet } from "react-native";
import { Text, Button, Icon } from "react-native-paper";
import { useAppTheme } from "@/hooks/use-app-theme";

type ErrorScreenProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.background,
      padding: 24,
      gap: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.colors.onBackground,
    },
    message: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
    },
    button: {
      marginTop: 8,
    },
  });

  return (
    <View style={styles.container}>
      <Icon
        source="alert-circle-outline"
        size={48}
        color={theme.colors.error}
      />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button mode="contained" onPress={onRetry} style={styles.button}>
          Try Again
        </Button>
      )}
    </View>
  );
}
