import {
  clearAuthStorage,
  getAppOrigin,
  getAppScheme,
  getAuthClient,
  getAuthHeaders,
} from "@/lib/auth/auth-client";
import {
  jsonResponse,
  SESSION_COOKIE,
  SESSION_SET_COOKIE,
} from "../../helpers/responses";

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

const mockExpoConfig: { scheme?: string | string[]; extra: object } = {
  scheme: "cellarboss",
  extra: {},
};
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockExpoConfig;
    },
  },
}));

const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

const user = {
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

async function signInWithCookie() {
  mockFetch.mockResolvedValueOnce(
    jsonResponse(
      { token: "abc", user, redirect: false },
      { headers: { "set-cookie": SESSION_SET_COOKIE } },
    ),
  );
  const client = await getAuthClient();
  await client!.signIn.email({ email: user.email, password: "password" });
}

beforeEach(async () => {
  await clearAuthStorage();
  mockStore.clear();
  mockFetch.mockReset();
  // The client may refresh the session in the background
  mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(null)));
  mockExpoConfig.scheme = "cellarboss";
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("getAppScheme", () => {
  it("reads the scheme from the Expo config", () => {
    mockExpoConfig.scheme = "otherscheme";
    expect(getAppScheme()).toBe("otherscheme");
  });

  it("uses the first scheme when several are configured", () => {
    mockExpoConfig.scheme = ["first", "second"];
    expect(getAppScheme()).toBe("first");
  });

  it("falls back to cellarboss", () => {
    mockExpoConfig.scheme = undefined;
    expect(getAppScheme()).toBe("cellarboss");
  });
});

describe("getAppOrigin", () => {
  it("is the scheme as an origin", () => {
    expect(getAppOrigin()).toBe("cellarboss://");
  });
});

describe("getAuthClient", () => {
  it("falls back to the default API URL when no server is stored", async () => {
    mockStore.delete("cellarboss_server_url");
    const client = await getAuthClient();
    await client!.getSession();
    expect(callTo("/get-session").url).toBe(
      "http://localhost:5000/api/auth/get-session",
    );
  });

  it("reuses the client for the same server", async () => {
    const first = await getAuthClient();
    const second = await getAuthClient();
    expect(second).toBe(first);
  });

  it("creates a new client when the server URL changes", async () => {
    const first = await getAuthClient();
    mockStore.set("cellarboss_server_url", "https://other.example.com");
    const second = await getAuthClient();
    expect(second).not.toBe(first);
  });

  it("sends auth requests to the configured server", async () => {
    await signInWithCookie();
    expect(callTo("/sign-in/email").url).toBe(
      "https://cellar.example.com/api/auth/sign-in/email",
    );
  });

  it("sends the app origin and omits native cookies", async () => {
    await signInWithCookie();

    const { init } = callTo("/sign-in/email");
    const headers = new Headers(init.headers);
    expect(headers.get("origin")).toBe("cellarboss://");
    expect(init.credentials).toBe("omit");
  });

  it("stores the session cookie and sends it on later requests", async () => {
    await signInWithCookie();
    mockFetch.mockClear();

    const client = await getAuthClient();
    await client!.getSession();

    const headers = new Headers(callTo("/get-session").init.headers);
    expect(headers.get("cookie")).toBe(SESSION_COOKIE);
    expect(headers.get("origin")).toBe("cellarboss://");
  });
});

describe("getAuthHeaders", () => {
  it("is empty before sign-in", async () => {
    expect(await getAuthHeaders()).toEqual({});
  });

  it("returns the session cookie after sign-in", async () => {
    await signInWithCookie();
    expect(await getAuthHeaders()).toEqual({ Cookie: SESSION_COOKIE });
  });
});

describe("clearAuthStorage", () => {
  it("forgets the stored session", async () => {
    await signInWithCookie();
    expect(mockStore.has("cellarboss_cookie")).toBe(true);

    await clearAuthStorage();

    expect(mockStore.has("cellarboss_cookie")).toBe(false);
    expect(mockStore.has("cellarboss_session_data")).toBe(false);
    expect(await getAuthHeaders()).toEqual({});
  });
});
