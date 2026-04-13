import { View, StyleSheet, StatusBar } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, ActivityIndicator } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ThemeProvider as NavigationThemeProvider,
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from "@react-navigation/native";
import { en, registerTranslation } from "react-native-paper-dates";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { NavigationHistoryProvider } from "@/contexts/navigation-history-context";
import {
  ThemePreferenceProvider,
  useThemePreference,
} from "@/contexts/theme-context";
import { useAppTheme } from "@/hooks/use-app-theme";

// TODO: Support multiple languages and read the user's preferred language from the server settings
registerTranslation("en", en);

const queryClient = new QueryClient();

function AuthGate() {
  const auth = useAuth();
  const theme = useAppTheme();

  if (auth.status === "loading") {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

function AppProviders() {
  const { theme, isDark } = useThemePreference();
  const navigationTheme = isDark ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationThemeProvider value={navigationTheme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <NavigationHistoryProvider>
              <StatusBar
                barStyle={isDark ? "light-content" : "dark-content"}
                translucent={true}
              />
              <AuthGate />
            </NavigationHistoryProvider>
          </AuthProvider>
        </QueryClientProvider>
      </NavigationThemeProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <ThemePreferenceProvider>
          <AppProviders />
        </ThemePreferenceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
