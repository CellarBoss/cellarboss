import {
  signIn,
  signOut,
  getSession,
  testServerConnection,
} from "@/lib/auth/auth-service";
import { clearAuthStorage, getAuthHeaders } from "@/lib/auth/auth-client";
import {
  CLEARED_SET_COOKIE,
  htmlResponse,
  jsonResponse,
  SESSION_COOKIE,
  SESSION_SET_COOKIE,
} from "../../helpers/responses";

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

// Mock expo-constants for env.ts and the app scheme
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      scheme: "cellarboss",
      extra: {
        apiBaseUrl: "http://localhost:5000",
      },
    },
  },
}));

// Mock fetch
const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  role: "admin",
};

function callTo(path: string) {
  const call = mockFetch.mock.calls.find(([url]) => String(url).endsWith(path));
  if (!call) throw new Error(`No request to ${path}`);
  return { url: String(call[0]), init: call[1] };
}

/** Route mocked requests by path; anything else gets a null session */
function respondWith(routes: Record<string, () => Response | Promise<never>>) {
  mockFetch.mockImplementation((url: string) => {
    const path = new URL(String(url)).pathname;
    const route = routes[path];
    return route ? route() : Promise.resolve(jsonResponse(null));
  });
}

async function signInSuccessfully() {
  respondWith({
    "/api/auth/sign-in/email": () =>
      jsonResponse(
        { token: "abc", user: mockUser, redirect: false },
        { headers: { "set-cookie": SESSION_SET_COOKIE } },
      ),
  });
  return signIn("test@example.com", "password");
}

beforeEach(async () => {
  await clearAuthStorage();
  mockStore.clear();
  mockFetch.mockReset();
  respondWith({});
  // Set server URL so requests work
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("auth-service", () => {
  describe("signIn", () => {
    it("returns the user and stores the session on success", async () => {
      const result = await signInSuccessfully();

      expect(result).toEqual({ ok: true, user: mockUser });
      expect(await getAuthHeaders()).toEqual({ Cookie: SESSION_COOKIE });
    });

    it("posts the credentials with the app origin", async () => {
      await signInSuccessfully();

      const { url, init } = callTo("/sign-in/email");
      expect(url).toBe("https://cellar.example.com/api/auth/sign-in/email");
      expect(JSON.parse(init.body)).toEqual({
        email: "test@example.com",
        password: "password",
      });
      expect(new Headers(init.headers).get("origin")).toBe("cellarboss://");
    });

    it("saves the email for next time", async () => {
      await signInSuccessfully();
      expect(mockStore.get("cellarboss_email")).toBe("test@example.com");
    });

    it("defaults the role when the server omits it", async () => {
      const { role: _role, ...userWithoutRole } = mockUser;
      respondWith({
        "/api/auth/sign-in/email": () =>
          jsonResponse({ token: "abc", user: userWithoutRole }),
      });

      const result = await signIn("test@example.com", "password");

      expect(result).toEqual({
        ok: true,
        user: { ...userWithoutRole, role: "user" },
      });
    });

    it("returns the server's error on invalid credentials", async () => {
      respondWith({
        "/api/auth/sign-in/email": () =>
          jsonResponse(
            {
              code: "INVALID_EMAIL_OR_PASSWORD",
              message: "Invalid email or password",
            },
            { status: 401 },
          ),
      });

      const result = await signIn("test@example.com", "wrong");

      expect(result).toEqual({
        ok: false,
        error: "Invalid email or password",
      });
      expect(mockStore.has("cellarboss_email")).toBe(false);
    });

    it("returns the server's error when the origin is rejected", async () => {
      respondWith({
        "/api/auth/sign-in/email": () =>
          jsonResponse(
            { code: "INVALID_ORIGIN", message: "Invalid origin" },
            { status: 403 },
          ),
      });

      const result = await signIn("test@example.com", "password");

      expect(result).toEqual({ ok: false, error: "Invalid origin" });
    });

    it("returns an error when the server can't be reached", async () => {
      respondWith({
        "/api/auth/sign-in/email": () =>
          Promise.reject(new Error("Network request failed")),
      });

      const result = await signIn("test@example.com", "password");

      expect(result.ok).toBe(false);
    });
  });

  describe("getSession", () => {
    it("returns the user for a valid session", async () => {
      await signInSuccessfully();
      respondWith({
        "/api/auth/get-session": () =>
          jsonResponse({ user: mockUser, session: { id: "session-1" } }),
      });

      const result = await getSession();

      expect(result).toEqual({ ok: true, user: mockUser });
      const { init } = callTo("/get-session");
      expect(new Headers(init.headers).get("cookie")).toBe(SESSION_COOKIE);
    });

    it("returns not ok when there is no session", async () => {
      respondWith({ "/api/auth/get-session": () => jsonResponse(null) });

      expect(await getSession()).toEqual({ ok: false });
    });

    it("returns not ok when the server rejects the session", async () => {
      respondWith({
        "/api/auth/get-session": () =>
          jsonResponse({ message: "Unauthorized" }, { status: 401 }),
      });

      expect(await getSession()).toEqual({ ok: false });
    });

    it("returns not ok when the server can't be reached", async () => {
      respondWith({
        "/api/auth/get-session": () =>
          Promise.reject(new Error("Network request failed")),
      });

      expect(await getSession()).toEqual({ ok: false });
    });
  });

  describe("signOut", () => {
    it("signs out on the server and forgets the session", async () => {
      await signInSuccessfully();
      respondWith({
        "/api/auth/sign-out": () =>
          jsonResponse(
            { success: true },
            { headers: { "set-cookie": CLEARED_SET_COOKIE } },
          ),
      });

      await signOut();

      const { init } = callTo("/sign-out");
      const headers = new Headers(init.headers);
      expect(init.method).toBe("POST");
      expect(headers.get("cookie")).toBe(SESSION_COOKIE);
      expect(headers.get("origin")).toBe("cellarboss://");
      expect(await getAuthHeaders()).toEqual({});
    });

    it("does not throw when the server can't be reached", async () => {
      respondWith({
        "/api/auth/sign-out": () =>
          Promise.reject(new Error("Network request failed")),
      });

      await expect(signOut()).resolves.toBeUndefined();
    });
  });

  describe("testServerConnection", () => {
    it("accepts a CellarBoss backend", async () => {
      respondWith({
        "/api/version": () => jsonResponse({ version: "v0.10.3" }),
      });

      expect(await testServerConnection("https://cellar.example.com")).toBe(
        "ok",
      );
      expect(callTo("/api/version").url).toBe(
        "https://cellar.example.com/api/version",
      );
    });

    it("rejects the web frontend, which answers with an HTML page", async () => {
      respondWith({ "/api/version": () => htmlResponse() });

      expect(await testServerConnection("https://cellar.example.com")).toBe(
        "not-cellarboss",
      );
    });

    it("rejects JSON without a version", async () => {
      respondWith({ "/api/version": () => jsonResponse({ ok: true }) });

      expect(await testServerConnection("https://cellar.example.com")).toBe(
        "not-cellarboss",
      );
    });

    it("rejects an error response", async () => {
      respondWith({
        "/api/version": () =>
          jsonResponse({ version: "v0.10.3" }, { status: 500 }),
      });

      expect(await testServerConnection("https://cellar.example.com")).toBe(
        "not-cellarboss",
      );
    });

    it("reports an unreachable server", async () => {
      respondWith({
        "/api/version": () =>
          Promise.reject(new Error("Network request failed")),
      });

      expect(await testServerConnection("https://cellar.example.com")).toBe(
        "unreachable",
      );
    });
  });
});
