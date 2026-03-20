import {
  signIn,
  signOut,
  getSession,
  testServerConnection,
} from "@/lib/auth/auth-service";

// Mock secure store
const mockStore = new Map<string, string>();
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn((key: string) =>
    Promise.resolve(mockStore.get(key) ?? null),
  ),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockStore.set(key, value);
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key: string) => {
    mockStore.delete(key);
    return Promise.resolve();
  }),
}));

// Mock expo-constants for env.ts
jest.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: "http://localhost:5000",
      },
    },
  },
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "admin",
};

beforeEach(() => {
  mockStore.clear();
  mockFetch.mockReset();
  // Set server URL so requests work
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("auth-service", () => {
  describe("signIn", () => {
    it("stores token and returns user on success", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "session-token", user: mockUser }),
      });

      const result = await signIn("test@example.com", "password");

      expect(result).toEqual({ ok: true, user: mockUser });
      expect(mockStore.get("cellarboss_auth_token")).toBe("session-token");
      expect(mockStore.get("cellarboss_email")).toBe("test@example.com");
    });

    it("returns error on invalid credentials", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Invalid credentials" }),
      });

      const result = await signIn("test@example.com", "wrong");

      expect(result).toEqual({ ok: false, error: "Invalid credentials" });
      expect(mockStore.has("cellarboss_auth_token")).toBe(false);
    });

    it("returns error on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network request failed"));

      const result = await signIn("test@example.com", "password");

      expect(result).toEqual({ ok: false, error: "Network request failed" });
    });

    it("falls back to env URL when server URL is not in secure store", async () => {
      mockStore.delete("cellarboss_server_url");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ token: "token", user: mockUser }),
      });

      const result = await signIn("test@example.com", "password");

      expect(result).toEqual({ ok: true, user: mockUser });
      // Should use the fallback from env.ts
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/sign-in/email",
        expect.anything(),
      );
    });
  });

  describe("getSession", () => {
    it("returns user when session is valid", async () => {
      mockStore.set("cellarboss_auth_token", "valid-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser, session: {} }),
      });

      const result = await getSession();

      expect(result).toEqual({ ok: true, user: mockUser });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://cellar.example.com/api/auth/get-session",
        expect.objectContaining({
          headers: { Authorization: "Bearer valid-token" },
        }),
      );
    });

    it("returns ok: false when no token is stored", async () => {
      const result = await getSession();
      expect(result).toEqual({ ok: false });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("returns ok: false when session is expired", async () => {
      mockStore.set("cellarboss_auth_token", "expired-token");

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve(null),
      });

      const result = await getSession();
      expect(result).toEqual({ ok: false });
    });

    it("returns ok: false on network error", async () => {
      mockStore.set("cellarboss_auth_token", "token");

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await getSession();
      expect(result).toEqual({ ok: false });
    });
  });

  describe("signOut", () => {
    it("calls sign-out endpoint and clears token", async () => {
      mockStore.set("cellarboss_auth_token", "my-token");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await signOut();

      expect(mockFetch).toHaveBeenCalledWith(
        "https://cellar.example.com/api/auth/sign-out",
        expect.objectContaining({
          method: "POST",
          headers: { Authorization: "Bearer my-token" },
        }),
      );
      expect(mockStore.has("cellarboss_auth_token")).toBe(false);
    });

    it("clears token even if sign-out request fails", async () => {
      mockStore.set("cellarboss_auth_token", "my-token");

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await signOut();

      expect(mockStore.has("cellarboss_auth_token")).toBe(false);
    });
  });

  describe("testServerConnection", () => {
    it("returns true when server responds with 200", async () => {
      mockFetch.mockResolvedValueOnce({ status: 200 });

      const result = await testServerConnection("https://cellar.example.com");
      expect(result).toBe(true);
    });

    it("returns true when server responds with 401", async () => {
      mockFetch.mockResolvedValueOnce({ status: 401 });

      const result = await testServerConnection("https://cellar.example.com");
      expect(result).toBe(true);
    });

    it("returns false on network error", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await testServerConnection("https://cellar.example.com");
      expect(result).toBe(false);
    });
  });
});
