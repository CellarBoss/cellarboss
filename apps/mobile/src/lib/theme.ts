import { MD3LightTheme } from "react-native-paper";

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#7c3aed",
    primaryContainer: "#ede9fe",
    secondary: "#a855f7",
    secondaryContainer: "#f3e8ff",
    tertiary: "#6d28d9",
    tertiaryContainer: "#ddd6fe",
    error: "#dc2626",
    errorContainer: "#fef2f2",
    background: "#f5f5f5",
    surface: "#ffffff",
    surfaceVariant: "#f8f8f8",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#4c1d95",
    onSecondary: "#ffffff",
    onSecondaryContainer: "#581c87",
    onTertiary: "#ffffff",
    onError: "#ffffff",
    onErrorContainer: "#991b1b",
    onBackground: "#1a1a1a",
    onSurface: "#1a1a1a",
    onSurfaceVariant: "#666666",
    outline: "#dddddd",
    outlineVariant: "#eeeeee",
  },
};

export type AppTheme = typeof theme;

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;
