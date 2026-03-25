import {
  getToken,
  setToken,
  clearToken,
  getServerUrl,
  setServerUrl,
  clearServerUrl,
  getSavedEmail,
  setSavedEmail,
  clearSavedEmail,
  clearAll,
} from "@/lib/auth/secure-store";

// Mock expo-secure-store
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

beforeEach(() => {
  mockStore.clear();
});

describe("secure-store", () => {
  describe("token", () => {
    it("returns null when no token is stored", async () => {
      expect(await getToken()).toBeNull();
    });

    it("stores and retrieves a token", async () => {
      await setToken("my-token");
      expect(await getToken()).toBe("my-token");
    });

    it("clears the token", async () => {
      await setToken("my-token");
      await clearToken();
      expect(await getToken()).toBeNull();
    });
  });

  describe("server URL", () => {
    it("returns null when no URL is stored", async () => {
      expect(await getServerUrl()).toBeNull();
    });

    it("stores and retrieves a server URL", async () => {
      await setServerUrl("https://cellar.example.com");
      expect(await getServerUrl()).toBe("https://cellar.example.com");
    });

    it("clears the server URL", async () => {
      await setServerUrl("https://cellar.example.com");
      await clearServerUrl();
      expect(await getServerUrl()).toBeNull();
    });
  });

  describe("saved email", () => {
    it("stores and retrieves email", async () => {
      await setSavedEmail("user@example.com");
      expect(await getSavedEmail()).toBe("user@example.com");
    });

    it("clears email", async () => {
      await setSavedEmail("user@example.com");
      await clearSavedEmail();
      expect(await getSavedEmail()).toBeNull();
    });
  });

  describe("clearAll", () => {
    it("clears all stored values", async () => {
      await setToken("token");
      await setServerUrl("https://example.com");
      await setSavedEmail("user@example.com");

      await clearAll();

      expect(await getToken()).toBeNull();
      expect(await getServerUrl()).toBeNull();
      expect(await getSavedEmail()).toBeNull();
    });
  });
});
