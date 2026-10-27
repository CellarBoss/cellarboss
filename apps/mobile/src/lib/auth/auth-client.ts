import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { getApiBaseUrl } from "@/lib/api/base-url";

/** Prefix for the keys the Expo client keeps in SecureStore */
const STORAGE_PREFIX = "cellarboss";
const STORAGE_KEYS = [
  `${STORAGE_PREFIX}_cookie`,
  `${STORAGE_PREFIX}_session_data`,
];

const DEFAULT_SCHEME = "cellarboss";

/** The app's URL scheme, from `scheme` in app.config.ts */
export function getAppScheme(): string {
  const scheme = Constants.expoConfig?.scheme;
  return (Array.isArray(scheme) ? scheme[0] : scheme) ?? DEFAULT_SCHEME;
}

/**
 * The origin the app sends with auth requests. The backend trusts it
 * (MOBILE_APP_ORIGIN in apps/backend/src/utils/auth.ts), so users don't need
 * to add the server's own address to CORS.
 */
export function getAppOrigin(): string {
  return `${getAppScheme()}://`;
}

function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    fetchOptions: {
      headers: { Origin: getAppOrigin() },
    },
    plugins: [
      adminClient(),
      expoClient({
        scheme: getAppScheme(),
        storagePrefix: STORAGE_PREFIX,
        storage: SecureStore,
        // AuthProvider holds the session state, so skip the client's cache
        disableCache: true,
      }),
    ],
  });
}

export type AuthClient = ReturnType<typeof createClient>;

let cached: { baseURL: string; client: AuthClient } | null = null;

/**
 * Returns a Better Auth client for the configured server, or null if no
 * server is set up yet. The server URL is entered at runtime, so the client
 * is created lazily and replaced if the URL changes.
 */
export async function getAuthClient(): Promise<AuthClient | null> {
  const baseURL = await getApiBaseUrl();

  if (!baseURL) {
    return null;
  }

  if (cached?.baseURL !== baseURL) {
    cached = { baseURL, client: createClient(baseURL) };
  }

  return cached.client;
}

/** Headers that authenticate a request to the CellarBoss API */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const client = await getAuthClient();
  const cookie = client ? await client.getCookie() : "";

  return cookie ? { Cookie: cookie } : {};
}

/** Forget the stored session, e.g. when switching to a different server */
export async function clearAuthStorage(): Promise<void> {
  cached = null;
  await Promise.all(
    STORAGE_KEYS.map((key) => SecureStore.deleteItemAsync(key)),
  );
}
