import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { authStyles as styles } from "@/styles/auth";
import { useRouter } from "expo-router";
import { setServerUrl } from "@/lib/auth/secure-store";
import { testServerConnection } from "@/lib/auth/auth-service";
import { useAuth } from "@/contexts/auth-context";

export default function SetupScreen() {
  const router = useRouter();
  const { markServerConfigured } = useAuth();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  async function handleConnect() {
    console.debug("Starting server connection test...");

    setError(null);

    let trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter your CellarBoss server URL");
      return;
    }

    // Strip trailing slash
    trimmed = trimmed.replace(/\/+$/, "");

    // Add https:// if no protocol specified
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    setTesting(true);

    const reachable = await testServerConnection(trimmed);

    if (!reachable) {
      setError(
        "Could not connect to this server. Please check the URL and try again.",
      );
      setTesting(false);
      return;
    }

    await setServerUrl(trimmed);
    setTesting(false);
    markServerConfigured();
    router.replace("/(auth)/login");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to CellarBoss</Text>
          <Text style={styles.subtitle}>
            Enter the URL of your CellarBoss server to get started.
          </Text>

          <Text style={styles.label}>Server URL</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="e.g. cellar.example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleConnect}
            editable={!testing}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, testing && styles.buttonDisabled]}
            onPress={handleConnect}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Connect</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
