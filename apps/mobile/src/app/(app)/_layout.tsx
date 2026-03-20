import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/contexts/auth-context";

export default function AppLayout() {
  const auth = useAuth();

  if (auth.status === "needs-setup") {
    return <Redirect href="/(auth)/setup" />;
  }

  if (auth.status !== "authenticated") {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
