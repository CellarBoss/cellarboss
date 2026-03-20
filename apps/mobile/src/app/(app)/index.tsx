import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/auth-context";

export default function HomeScreen() {
  const auth = useAuth();
  const user = auth.status === "authenticated" ? auth.user : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>CellarBoss</Text>
        <Text style={styles.subtitle}>Wine Cellar Management</Text>
        {user && (
          <Text style={styles.welcome}>Welcome, {user.name || user.email}</Text>
        )}
        <Pressable style={styles.signOut} onPress={() => auth.signOut()}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
  },
  welcome: {
    fontSize: 14,
    color: "#333",
    marginBottom: 16,
  },
  signOut: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  signOutText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
});
