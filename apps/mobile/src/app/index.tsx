import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/auth-context";

export default function Index() {
  const auth = useAuth();

  switch (auth.status) {
    case "needs-setup":
      return <Redirect href="/(auth)/setup" />;
    case "unauthenticated":
      return <Redirect href="/(auth)/login" />;
    case "authenticated":
      return <Redirect href="/(app)" />;
    default:
      return null;
  }
}
