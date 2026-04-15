import { View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { VersionMismatchBanner } from "@/components/VersionMismatchBanner";

export default function AppLayout() {
  const auth = useAuth();

  if (auth.status === "needs-setup") {
    return <Redirect href="/(auth)/setup" />;
  }

  if (auth.status !== "authenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <VersionMismatchBanner />
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}
