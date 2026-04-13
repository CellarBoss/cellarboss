import { useState } from "react";
import { Banner } from "react-native-paper";
import Constants from "expo-constants";
import { useVersionMismatch } from "@cellarboss/common";
import { api } from "@/lib/api/client";

const appVersion = Constants.expoConfig?.version ?? "0.0.0";

export function VersionMismatchBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { isMismatch, backendVersion } = useVersionMismatch({
    frontendVersion: appVersion,
    queryFn: () => api.version.get(),
  });

  return (
    <Banner
      visible={isMismatch && !dismissed}
      icon="alert"
      actions={[{ label: "Dismiss", onPress: () => setDismissed(true) }]}
    >
      Your app (v{appVersion}) is newer than the server (v{backendVersion}).
      Some features may not work until the server is updated.
    </Banner>
  );
}
