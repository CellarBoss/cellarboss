import { ScrollView, StyleSheet } from "react-native";
import { List, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { theme } from "@/lib/theme";

export default function MoreScreen() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth.status === "authenticated" ? auth.user : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="More" />
      <ScrollView>
        <List.Section>
          <List.Subheader>Wine Data</List.Subheader>
          <List.Item
            title="Vintages"
            left={(props) => <List.Icon {...props} icon="calendar-range" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/vintages")}
          />
          <List.Item
            title="Tasting Notes"
            left={(props) => <List.Icon {...props} icon="note-text-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/tasting-notes")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Reference Data</List.Subheader>
          <List.Item
            title="Winemakers"
            left={(props) => (
              <List.Icon {...props} icon="account-group-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/winemakers")}
          />
          <List.Item
            title="Regions"
            left={(props) => <List.Icon {...props} icon="map-marker-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/regions")}
          />
          <List.Item
            title="Countries"
            left={(props) => <List.Icon {...props} icon="earth" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/countries")}
          />
          <List.Item
            title="Grapes"
            left={(props) => (
              <List.Icon {...props} icon="fruit-grapes-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/grapes")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Storage</List.Subheader>
          <List.Item
            title="Storages"
            left={(props) => <List.Icon {...props} icon="warehouse" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/storages")}
          />
          <List.Item
            title="Locations"
            left={(props) => (
              <List.Icon {...props} icon="map-marker-radius-outline" />
            )}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/locations")}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Account</List.Subheader>
          <List.Item
            title="Profile"
            description={user?.email}
            left={(props) => <List.Icon {...props} icon="account-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => router.push("/(app)/profile")}
          />
          {user?.role === "admin" && (
            <>
              <List.Item
                title="Settings"
                left={(props) => <List.Icon {...props} icon="cog-outline" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/(app)/settings")}
              />
              <List.Item
                title="Users"
                left={(props) => (
                  <List.Icon {...props} icon="account-multiple-outline" />
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => router.push("/(app)/users")}
              />
            </>
          )}
          <List.Item
            title="Sign Out"
            titleStyle={{ color: theme.colors.error }}
            left={(props) => (
              <List.Icon {...props} icon="logout" color={theme.colors.error} />
            )}
            onPress={() => auth.signOut()}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
