import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";
import { theme } from "@/lib/theme";

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  message: {
    marginTop: 16,
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
});
