import { View, StyleSheet, StatusBar } from "react-native";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider, ActivityIndicator } from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { en, registerTranslation } from "react-native-paper-dates";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { NavigationHistoryProvider } from "@/contexts/navigation-history-context";
import { theme } from "@/lib/theme";

// TODO: Support multiple languages and read the user's preferred language from the server settings
registerTranslation("en", en);

const queryClient = new QueryClient();

function AuthGate() {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <NavigationHistoryProvider>
                <StatusBar barStyle="dark-content" translucent={true} />
                <AuthGate />
              </NavigationHistoryProvider>
            </AuthProvider>
          </QueryClientProvider>
        </PaperProvider>
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
    backgroundColor: "#fff",
  },
});
