import { MD3LightTheme } from "react-native-paper";

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#5D1D2E",
    primaryContainer: "#F5E6EA",
    secondary: "#8B4557",
    secondaryContainer: "#F8E8EC",
    tertiary: "#4A1524",
    tertiaryContainer: "#EADCE0",
    error: "#BA1A1A",
    errorContainer: "#FFDAD6",
    background: "#FBF8F8",
    surface: "#ffffff",
    surfaceVariant: "#F5EEEF",
    onPrimary: "#ffffff",
    onPrimaryContainer: "#3A0F1C",
    onSecondary: "#ffffff",
    onSecondaryContainer: "#5D1D2E",
    onTertiary: "#ffffff",
    onError: "#ffffff",
    onErrorContainer: "#8C1515",
    onBackground: "#1C1B1B",
    onSurface: "#1C1B1B",
    onSurfaceVariant: "#524344",
    outline: "#B5A1A3",
    outlineVariant: "#D8C2C4",
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
