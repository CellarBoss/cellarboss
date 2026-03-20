import { useState, useEffect } from "react";
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
import { useAuth } from "@/contexts/auth-context";
import { getSavedEmail, getServerUrl } from "@/lib/auth/secure-store";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, resetServer } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [serverUrl, setServerUrlDisplay] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDefaults() {
      const saved = await getSavedEmail();
      if (saved) setEmail(saved);

      const url = await getServerUrl();
      if (url) setServerUrlDisplay(url);
    }
    loadDefaults();
  }, []);

  async function handleSignIn() {
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      router.replace("/(app)");
    }
  }

  async function handleChangeServer() {
    await resetServer();
    router.replace("/(auth)/setup");
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
          <Text style={styles.title}>Sign In</Text>
          {serverUrl ? <Text style={styles.serverUrl}>{serverUrl}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSignIn}
            editable={!loading}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </Pressable>

          <Pressable style={styles.link} onPress={handleChangeServer}>
            <Text style={styles.linkText}>Change server</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
