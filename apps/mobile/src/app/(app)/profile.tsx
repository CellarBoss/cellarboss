import { View, StyleSheet } from "react-native";
import { Text, Button, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAuth } from "@/contexts/auth-context";
import { theme } from "@/lib/theme";

export default function ProfileScreen() {
  const auth = useAuth();
  const user = auth.status === "authenticated" ? auth.user : null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScreenHeader title="Profile" showBack />
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user?.name ?? "-"}</Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? "-"}</Text>
        </View>

        <Divider />

        <View style={styles.section}>
          <Text style={styles.label}>Role</Text>
          <Text style={styles.value}>{user?.role ?? "-"}</Text>
        </View>

        <View style={styles.signOutSection}>
          <Button
            testID="sign-out-button"
            mode="outlined"
            onPress={() => auth.signOut()}
            textColor={theme.colors.error}
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  signOutSection: {
    padding: 16,
    marginTop: 24,
  },
  signOutButton: {
    borderColor: theme.colors.error,
  },
});
