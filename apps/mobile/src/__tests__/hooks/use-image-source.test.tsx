import { renderHook, waitFor } from "@testing-library/react-native";
import { useImageSource } from "@/hooks/use-image-source";
import { clearAuthStorage } from "@/lib/auth/auth-client";
import { SESSION_COOKIE, STORED_SESSION } from "../helpers/responses";

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

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: {
    expoConfig: {
      scheme: "cellarboss",
      extra: { apiBaseUrl: "http://localhost:5000" },
    },
  },
}));

beforeEach(async () => {
  await clearAuthStorage();
  mockStore.clear();
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("useImageSource", () => {
  it("authenticates image requests with the session cookie", async () => {
    mockStore.set("cellarboss_cookie", STORED_SESSION);

    const { result } = renderHook(() => useImageSource());

    await waitFor(() => {
      expect(result.current.thumbSource(4)).toEqual({
        uri: "https://cellar.example.com/api/image/4/thumb",
        headers: { Cookie: SESSION_COOKIE },
      });
    });
    expect(result.current.fullSource(4)).toEqual({
      uri: "https://cellar.example.com/api/image/4/file",
      headers: { Cookie: SESSION_COOKIE },
    });
  });

  it("sends no auth headers when signed out", async () => {
    const { result } = renderHook(() => useImageSource());

    await waitFor(() => {
      expect(result.current.thumbSource(4)).toEqual({
        uri: "https://cellar.example.com/api/image/4/thumb",
        headers: {},
      });
    });
  });
});
