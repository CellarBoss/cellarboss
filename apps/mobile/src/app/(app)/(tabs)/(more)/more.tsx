import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { List, Divider, Dialog, Portal, RadioButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useThemePreference } from "@/contexts/theme-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useApiQuery } from "@/hooks/use-api-query";
import { api } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/base-url";
import type { ThemePreference } from "@/lib/auth/secure-store";
import * as Application from "expo-application";

const themeLabels: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "System default",
};

export default function MoreScreen() {
  const router = useRouter();
  const auth = useAuth();
  const theme = useAppTheme();
  const { preference, setPreference } = useThemePreference();
  const user = auth.status === "authenticated" ? auth.user : null;
  const styles = useStyles();
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);

  useEffect(() => {
    getApiBaseUrl().then(setApiBaseUrl);
  }, []);

  const versionQuery = useApiQuery({
    queryKey: ["version"],
    queryFn: () => api.version.get(),
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView>
        <List.Section>
          <List.Subheader>Wine Data</List.Subheader>
          <List.Item
            testID="menu-cellar"
            title="Cellar"
            left={(props) => (
              <List.Icon {...props} icon="bottle-wine-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/bottles")}
          />
          <List.Item
            testID="menu-wines"
            title="Wines"
            left={(props) => <List.Icon {...props} icon="glass-wine" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/wines")}
          />
          <List.Item
            testID="menu-tasting-notes"
            title="Tasting Notes"
            left={(props) => <List.Icon {...props} icon="note-text-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/tasting-notes")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Reference Data</List.Subheader>
          <List.Item
            testID="menu-winemakers"
            title="Winemakers"
            left={(props) => (
              <List.Icon {...props} icon="account-group-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/winemakers")}
          />
          <List.Item
            testID="menu-regions"
            title="Regions"
            left={(props) => <List.Icon {...props} icon="map-marker-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/regions")}
          />
          <List.Item
            testID="menu-countries"
            title="Countries"
            left={(props) => <List.Icon {...props} icon="earth" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/countries")}
          />
          <List.Item
            testID="menu-grapes"
            title="Grapes"
            left={(props) => (
              <List.Icon {...props} icon="fruit-grapes-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/grapes")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Storage</List.Subheader>
          <List.Item
            testID="menu-storages"
            title="Storages"
            left={(props) => <List.Icon {...props} icon="warehouse" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/storages")}
          />
          <List.Item
            testID="menu-locations"
            title="Locations"
            left={(props) => (
              <List.Icon {...props} icon="map-marker-radius-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/locations")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            testID="menu-profile"
            title="Profile"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="account-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/profile")}
          />
          <List.Item
            testID="menu-sign-out"
            title="Sign Out"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
            onPress={() => auth.signOut()}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          <List.Item
            testID="menu-appearance"
            title="Theme"
            description={themeLabels[preference]}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setThemeDialogVisible(true)}
          />
        </List.Section>

        <Portal>
          <Dialog
            visible={themeDialogVisible}
            onDismiss={() => setThemeDialogVisible(false)}
          >
            <Dialog.Title>Theme</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                value={preference}
                onValueChange={(value) => {
                  setPreference(value as ThemePreference);
                  setThemeDialogVisible(false);
                }}
              >
                <RadioButton.Item label="Light" value="light" />
                <RadioButton.Item label="Dark" value="dark" />
                <RadioButton.Item label="System default" value="system" />
              </RadioButton.Group>
            </Dialog.Content>
          </Dialog>
        </Portal>

        {apiBaseUrl && (
          <>
            <Divider />
            <List.Section>
              <List.Subheader>CellarBoss Server</List.Subheader>

              <List.Item
                testID="menu-server"
                title="URL"
                description={apiBaseUrl}
                left={(props) => <List.Icon {...props} icon="server-network" />}
              />
              <List.Item
                testID="menu-server-version"
                title="Version"
                description={versionQuery.data?.version}
                left={(props) => <List.Icon {...props} icon="tag-outline" />}
              />
            </List.Section>
          </>
        )}

        <Divider />
        <List.Section>
          <List.Subheader>CellarBoss Mobile</List.Subheader>
          <List.Item
            testID="menu-app-version"
            title="Application Version"
            description={Application.nativeApplicationVersion ?? "Unknown"}
            left={(props) => <List.Icon {...props} icon="wrench-outline" />}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function useStyles() {
  const theme = useAppTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
}
