import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { List, Divider, Dialog, Portal, RadioButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useThemePreference } from "@/contexts/theme-context";
import { useI18n } from "@/contexts/i18n-context";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useApiQuery } from "@/hooks/use-api-query";
import { useUpdateSetting } from "@/hooks/use-settings";
import { api } from "@/lib/api/client";
import { getApiBaseUrl } from "@/lib/api/base-url";
import type { ThemePreference } from "@/lib/auth/secure-store";
import * as Application from "expo-application";
import {
  getLanguageLabel,
  SUPPORTED_LANGUAGE_OPTIONS,
} from "@cellarboss/common/i18n";

export default function MoreScreen() {
  const router = useRouter();
  const auth = useAuth();
  const theme = useAppTheme();
  const { preference, setPreference } = useThemePreference();
  const { language, t } = useI18n();
  const updateSetting = useUpdateSetting();
  const user = auth.status === "authenticated" ? auth.user : null;
  const isAdmin = user?.role === "admin";
  const styles = useStyles();
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [languageDialogVisible, setLanguageDialogVisible] = useState(false);
  const themeLabels: Record<ThemePreference, string> = {
    light: t("theme.light"),
    dark: t("theme.dark"),
    system: t("theme.system"),
  };

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
          <List.Subheader>{t("section.wineData")}</List.Subheader>
          <List.Item
            testID="menu-cellar"
            title={t("nav.cellar")}
            left={(props) => (
              <List.Icon {...props} icon="bottle-wine-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/bottles")}
          />
          <List.Item
            testID="menu-wines"
            title={t("nav.wines")}
            left={(props) => <List.Icon {...props} icon="glass-wine" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/wines")}
          />
          <List.Item
            testID="menu-tasting-notes"
            title={t("nav.tastingNotes")}
            left={(props) => <List.Icon {...props} icon="note-text-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/tasting-notes")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{t("section.referenceData")}</List.Subheader>
          <List.Item
            testID="menu-winemakers"
            title={t("nav.winemakers")}
            left={(props) => (
              <List.Icon {...props} icon="account-group-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/winemakers")}
          />
          <List.Item
            testID="menu-regions"
            title={t("nav.regions")}
            left={(props) => <List.Icon {...props} icon="map-marker-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/regions")}
          />
          <List.Item
            testID="menu-countries"
            title={t("nav.countries")}
            left={(props) => <List.Icon {...props} icon="earth" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/countries")}
          />
          <List.Item
            testID="menu-grapes"
            title={t("nav.grapes")}
            left={(props) => (
              <List.Icon {...props} icon="fruit-grapes-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/grapes")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{t("section.storage")}</List.Subheader>
          <List.Item
            testID="menu-storages"
            title={t("nav.storages")}
            left={(props) => <List.Icon {...props} icon="warehouse" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/storages")}
          />
          <List.Item
            testID="menu-locations"
            title={t("nav.locations")}
            left={(props) => (
              <List.Icon {...props} icon="map-marker-radius-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/locations")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{t("section.account")}</List.Subheader>
          <List.Item
            testID="menu-profile"
            title={t("nav.profile")}
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="account-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/profile")}
          />
          <List.Item
            testID="menu-sign-out"
            title={t("action.signOut")}
            titleStyle={{ color: theme.colors.error }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
            onPress={() => auth.signOut()}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>{t("section.appearance")}</List.Subheader>
          <List.Item
            testID="menu-appearance"
            title={t("theme.title")}
            description={themeLabels[preference]}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setThemeDialogVisible(true)}
          />
          {isAdmin && (
            <List.Item
              testID="menu-language"
              title={t("settings.language")}
              description={getLanguageLabel(language)}
              left={(props) => <List.Icon {...props} icon="translate" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => setLanguageDialogVisible(true)}
            />
          )}
        </List.Section>

        <Portal>
          <Dialog
            visible={themeDialogVisible}
            onDismiss={() => setThemeDialogVisible(false)}
          >
            <Dialog.Title>{t("theme.title")}</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                value={preference}
                onValueChange={(value) => {
                  setPreference(value as ThemePreference);
                  setThemeDialogVisible(false);
                }}
              >
                <RadioButton.Item label={t("theme.light")} value="light" />
                <RadioButton.Item label={t("theme.dark")} value="dark" />
                <RadioButton.Item label={t("theme.system")} value="system" />
              </RadioButton.Group>
            </Dialog.Content>
          </Dialog>
          <Dialog
            visible={languageDialogVisible}
            onDismiss={() => setLanguageDialogVisible(false)}
          >
            <Dialog.Title>{t("settings.language")}</Dialog.Title>
            <Dialog.Content>
              <RadioButton.Group
                value={language}
                onValueChange={(value) => {
                  updateSetting.mutate({ key: "language", value });
                  setLanguageDialogVisible(false);
                }}
              >
                {SUPPORTED_LANGUAGE_OPTIONS.map((option) => (
                  <RadioButton.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                  />
                ))}
              </RadioButton.Group>
            </Dialog.Content>
          </Dialog>
        </Portal>

        {apiBaseUrl && (
          <>
            <Divider />
            <List.Section>
              <List.Subheader>{t("section.server")}</List.Subheader>

              <List.Item
                testID="menu-server"
                title={t("server.url")}
                description={apiBaseUrl}
                left={(props) => <List.Icon {...props} icon="server-network" />}
              />
              <List.Item
                testID="menu-server-version"
                title={t("server.version")}
                description={versionQuery.data?.version}
                left={(props) => <List.Icon {...props} icon="tag-outline" />}
              />
            </List.Section>
          </>
        )}

        <Divider />
        <List.Section>
          <List.Subheader>{t("section.mobile")}</List.Subheader>
          <List.Item
            testID="menu-app-version"
            title={t("mobile.applicationVersion")}
            description={
              Application.nativeApplicationVersion ?? t("status.unknown")
            }
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
