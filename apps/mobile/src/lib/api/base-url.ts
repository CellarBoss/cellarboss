import { getServerUrl } from "@/lib/auth/secure-store";
import { mobileEnv } from "@/lib/env";

/**
 * Returns the API base URL from secure store, falling back to the
 * environment default. Returns null only if neither is set.
 */
export async function getApiBaseUrl(): Promise<string | null> {
  const stored = await getServerUrl();
  return stored ?? mobileEnv.apiBaseUrl ?? null;
}
