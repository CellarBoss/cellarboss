import { StyleSheet } from "react-native";
import { useAppTheme } from "@/hooks/use-app-theme";
import { shadows } from "@/lib/theme";

export function useAuthStyles() {
  const theme = useAppTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 24,
      ...shadows.elevated,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: "center",
      marginBottom: 20,
    },
    serverUrl: {
      fontSize: 12,
      color: "#999",
      textAlign: "center",
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.outline,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      marginBottom: 16,
    },
    error: {
      color: theme.colors.error,
      fontSize: 13,
      marginBottom: 12,
    },
    button: {
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: "center",
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: "600",
    },
    link: {
      marginTop: 16,
      alignItems: "center",
    },
    linkText: {
      color: theme.colors.primary,
      fontSize: 14,
    },
  });
}
