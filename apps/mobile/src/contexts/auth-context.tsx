import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "@/lib/auth/auth-service";
import * as authService from "@/lib/auth/auth-service";
import { getServerUrl, clearServerUrl } from "@/lib/auth/secure-store";

type AuthState =
  | { status: "loading" }
  | { status: "needs-setup" }
  | { status: "unauthenticated" }
  | { status: "authenticated"; user: AuthUser };

type AuthContextValue = AuthState & {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  markServerConfigured: () => void;
  resetServer: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  // On mount: check if server is configured, then validate session
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const serverUrl = await getServerUrl();

      if (!serverUrl) {
        if (!cancelled) setState({ status: "needs-setup" });
        return;
      }

      const result = await authService.getSession();

      if (cancelled) return;

      if (result.ok) {
        setState({ status: "authenticated", user: result.user });
      } else {
        setState({ status: "unauthenticated" });
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authService.signIn(email, password);

    if (result.ok) {
      setState({ status: "authenticated", user: result.user });
      return { ok: true as const };
    }

    return { ok: false as const, error: result.error };
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setState({ status: "unauthenticated" });
  }, []);

  const markServerConfigured = useCallback(() => {
    setState({ status: "unauthenticated" });
  }, []);

  const resetServer = useCallback(async () => {
    await clearServerUrl();
    setState({ status: "needs-setup" });
  }, []);

  const value: AuthContextValue = {
    ...state,
    signIn,
    signOut,
    markServerConfigured,
    resetServer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
