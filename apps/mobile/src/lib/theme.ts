import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";

export const lightTheme = {
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

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#D4899B",
    primaryContainer: "#5D1D2E",
    secondary: "#C4889A",
    secondaryContainer: "#6B3347",
    tertiary: "#E8B4C0",
    tertiaryContainer: "#4A1524",
    error: "#FFB4AB",
    errorContainer: "#93000A",
    background: "#1C1B1B",
    surface: "#252323",
    surfaceVariant: "#352F30",
    onPrimary: "#3A0F1C",
    onPrimaryContainer: "#F5E6EA",
    onSecondary: "#3A0F1C",
    onSecondaryContainer: "#F8E8EC",
    onTertiary: "#2D0A17",
    onError: "#690005",
    onErrorContainer: "#FFDAD6",
    onBackground: "#E6E1E1",
    onSurface: "#E6E1E1",
    onSurfaceVariant: "#D8C2C4",
    outline: "#A08C8E",
    outlineVariant: "#524344",
  },
};

/** @deprecated Use `useAppTheme()` hook instead of importing this static theme */
export const theme = lightTheme;

export type AppTheme = typeof lightTheme;

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
