import { setSavedEmail } from "./secure-store";
import { getAuthClient } from "./auth-client";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type ClientUser = {
  id: string;
  email: string;
  name: string;
  role?: string | null;
};

function toAuthUser(user: ClientUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? "user",
  };
}

type SignInResult = { ok: true; user: AuthUser } | { ok: false; error: string };

type SessionResult = { ok: true; user: AuthUser } | { ok: false };

export type ServerCheckResult = "ok" | "unreachable" | "not-cellarboss";

/**
 * Sign in with email and password.
 * The Expo client stores the session cookie in secure store on success.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const client = await getAuthClient();

  if (!client) {
    return { ok: false, error: "Server URL not configured" };
  }

  try {
    const { data, error } = await client.signIn.email({ email, password });

    if (error || !data) {
      return { ok: false, error: error?.message ?? "Invalid credentials" };
    }

    // Save email for convenience on next login
    await setSavedEmail(email);

    return { ok: true, user: toAuthUser(data.user) };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unable to connect to server",
    };
  }
}

/**
 * Validate the stored session with the server.
 * Returns the user if valid, or { ok: false } if expired/invalid.
 */
export async function getSession(): Promise<SessionResult> {
  const client = await getAuthClient();

  if (!client) {
    return { ok: false };
  }

  try {
    const { data } = await client.getSession();

    if (!data?.user) {
      return { ok: false };
    }

    return { ok: true, user: toAuthUser(data.user) };
  } catch {
    return { ok: false };
  }
}

/**
 * Sign out. The Expo client clears the stored session cookie.
 */
export async function signOut(): Promise<void> {
  const client = await getAuthClient();

  try {
    await client?.signOut();
  } catch {
    // Best-effort — the session expires on the server regardless
  }
}

/**
 * Check that a URL points at a CellarBoss backend.
 *
 * Uses the public version endpoint, which only the backend serves as JSON.
 * The web frontend proxies /api/auth/*, so an auth endpoint can't tell the
 * two apart; for /api/version it redirects to its HTML login page instead.
 */
export async function testServerConnection(
  url: string,
): Promise<ServerCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  let res: Response;
  try {
    res = await fetch(`${url}/api/version`, { signal: controller.signal });
  } catch (e) {
    console.debug("Failed to connect to server", e);
    return "unreachable";
  } finally {
    clearTimeout(timeout);
  }

  try {
    const data = await res.json();
    return res.ok && typeof data?.version === "string"
      ? "ok"
      : "not-cellarboss";
  } catch {
    return "not-cellarboss";
  }
}
