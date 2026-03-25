import * as SecureStore from "expo-secure-store";

const KEYS = {
  TOKEN: "cellarboss_auth_token",
  SERVER_URL: "cellarboss_server_url",
  EMAIL: "cellarboss_email",
} as const;

// --- Auth token ---

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.TOKEN);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.TOKEN, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.TOKEN);
}

// --- Server URL ---

export async function getServerUrl(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.SERVER_URL);
}

export async function setServerUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.SERVER_URL, url);
}

export async function clearServerUrl(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.SERVER_URL);
}

// --- Saved email (convenience, not secret) ---

export async function getSavedEmail(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.EMAIL);
}

export async function setSavedEmail(email: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.EMAIL, email);
}

export async function clearSavedEmail(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.EMAIL);
}

// --- Clear all ---

export async function clearAll(): Promise<void> {
  await Promise.all([clearToken(), clearServerUrl(), clearSavedEmail()]);
}
