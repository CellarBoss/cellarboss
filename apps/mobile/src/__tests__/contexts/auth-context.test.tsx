import { renderHook, act, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

// Mock auth service
const mockSignIn = jest.fn();
const mockGetSession = jest.fn();
const mockSignOut = jest.fn();

jest.mock("@/lib/auth/auth-service", () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
  getSession: () => mockGetSession(),
  signOut: () => mockSignOut(),
}));

// Mock secure store
const mockGetServerUrl = jest.fn();
const mockClearServerUrl = jest.fn();

jest.mock("@/lib/auth/secure-store", () => ({
  getServerUrl: () => mockGetServerUrl(),
  clearServerUrl: () => mockClearServerUrl(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClearServerUrl.mockResolvedValue(undefined);
    mockSignOut.mockResolvedValue(undefined);
  });

  it("starts in loading state", () => {
    mockGetServerUrl.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.status).toBe("loading");
  });

  it("transitions to needs-setup when no server URL", async () => {
    mockGetServerUrl.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("needs-setup");
    });
  });

  it("transitions to unauthenticated when session invalid", async () => {
    mockGetServerUrl.mockResolvedValue("https://cellar.example.com");
    mockGetSession.mockResolvedValue({ ok: false });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });
  });

  it("transitions to authenticated when session valid", async () => {
    const user = {
      id: "1",
      email: "admin@test.com",
      name: "Admin",
      role: "admin",
    };
    mockGetServerUrl.mockResolvedValue("https://cellar.example.com");
    mockGetSession.mockResolvedValue({ ok: true, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });
    expect((result.current as { user: typeof user }).user).toEqual(user);
  });

  it("signIn success transitions to authenticated", async () => {
    mockGetServerUrl.mockResolvedValue(null);
    const user = { id: "1", email: "a@b.com", name: "Test", role: "admin" };
    mockSignIn.mockResolvedValue({ ok: true, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("needs-setup");
    });

    let signInResult: { ok: boolean };
    await act(async () => {
      signInResult = await result.current.signIn("a@b.com", "pass");
    });

    expect(signInResult!.ok).toBe(true);
    expect(result.current.status).toBe("authenticated");
  });

  it("signIn failure returns error and stays in current state", async () => {
    mockGetServerUrl.mockResolvedValue("https://cellar.example.com");
    mockGetSession.mockResolvedValue({ ok: false });
    mockSignIn.mockResolvedValue({ ok: false, error: "Invalid credentials" });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("unauthenticated");
    });

    let signInResult: { ok: boolean; error?: string };
    await act(async () => {
      signInResult = await result.current.signIn("a@b.com", "wrong");
    });

    expect(signInResult!.ok).toBe(false);
    expect((signInResult! as { error: string }).error).toBe(
      "Invalid credentials",
    );
    expect(result.current.status).toBe("unauthenticated");
  });

  it("signOut transitions to unauthenticated", async () => {
    const user = { id: "1", email: "a@b.com", name: "Test", role: "admin" };
    mockGetServerUrl.mockResolvedValue("https://cellar.example.com");
    mockGetSession.mockResolvedValue({ ok: true, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("markServerConfigured transitions to unauthenticated", async () => {
    mockGetServerUrl.mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("needs-setup");
    });

    act(() => {
      result.current.markServerConfigured();
    });

    expect(result.current.status).toBe("unauthenticated");
  });

  it("resetServer clears URL and transitions to needs-setup", async () => {
    const user = { id: "1", email: "a@b.com", name: "Test", role: "admin" };
    mockGetServerUrl.mockResolvedValue("https://cellar.example.com");
    mockGetSession.mockResolvedValue({ ok: true, user });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.status).toBe("authenticated");
    });

    await act(async () => {
      await result.current.resetServer();
    });

    expect(mockClearServerUrl).toHaveBeenCalled();
    expect(result.current.status).toBe("needs-setup");
  });
});
