import { getToken, setToken, clearToken, setSavedEmail } from "./secure-store";
import { getApiBaseUrl } from "@/lib/api/base-url";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type SignInResult = { ok: true; user: AuthUser } | { ok: false; error: string };

type SessionResult = { ok: true; user: AuthUser } | { ok: false };

/**
 * Sign in with email and password.
 * Stores the session token in secure store on success.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const baseUrl = await getApiBaseUrl();

  if (!baseUrl) {
    return { ok: false, error: "Server URL not configured" };
  }

  try {
    const res = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        error: data?.message ?? data?.error ?? "Invalid credentials",
      };
    }

    // better-auth returns { token, user } on sign-in
    if (data.token) {
      await setToken(data.token);
    }

    // Save email for convenience on next login
    await setSavedEmail(email);

    const user = data.user as AuthUser;
    return { ok: true, user };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unable to connect to server",
    };
  }
}

/**
 * Validate the current stored token by calling get-session.
 * Returns the user if valid, or { ok: false } if expired/invalid.
 */
export async function getSession(): Promise<SessionResult> {
  const baseUrl = await getApiBaseUrl();
  const token = await getToken();

  if (!baseUrl || !token) {
    return { ok: false };
  }

  try {
    const res = await fetch(`${baseUrl}/api/auth/get-session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return { ok: false };
    }

    const data = await res.json();

    if (!data || !data.user) {
      return { ok: false };
    }

    return { ok: true, user: data.user as AuthUser };
  } catch {
    return { ok: false };
  }
}

/**
 * Sign out — notify the server and clear the local token.
 */
export async function signOut(): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const token = await getToken();

  if (baseUrl && token) {
    try {
      await fetch(`${baseUrl}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Origin: baseUrl,
        },
      });
    } catch {
      // Best-effort — clear token regardless
    }
  }

  await clearToken();
}

/**
 * Test connectivity to a server URL.
 * Returns true if the server responds to the auth endpoint.
 */
export async function testServerConnection(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${url}/api/auth/get-session`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    // A 200 with null session or 401 both indicate the server is reachable
    return res.status === 200 || res.status === 401;
  } catch (e) {
    console.debug("Failed to connect to server", e);
    return false;
  }
}
