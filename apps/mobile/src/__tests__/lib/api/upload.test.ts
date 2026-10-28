import { uploadRequest } from "@/lib/api/upload";
import { UNEXPECTED_RESPONSE_MESSAGE } from "@/lib/api/request";
import { clearAuthStorage } from "@/lib/auth/auth-client";
import { SESSION_COOKIE, STORED_SESSION } from "../../helpers/responses";

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

const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

beforeEach(async () => {
  await clearAuthStorage();
  mockStore.clear();
  mockFetch.mockReset();
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("uploadRequest", () => {
  it("posts the form with the session cookie", async () => {
    mockStore.set("cellarboss_cookie", STORED_SESSION);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 7 })),
    });
    const formData = new FormData();

    const result = await uploadRequest("image/upload", formData);

    expect(result).toEqual({ ok: true, data: { id: 7 } });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://cellar.example.com/api/image/upload",
      {
        method: "POST",
        headers: { Cookie: SESSION_COOKIE },
        body: formData,
        credentials: "omit",
      },
    );
  });

  it("sends no auth headers when signed out", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("null"),
    });

    await uploadRequest("image/upload", new FormData());

    expect(mockFetch.mock.calls[0][1].headers).toEqual({});
  });

  it("returns a readable error for a non-JSON response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 413,
      text: () => Promise.resolve("<html>Request Entity Too Large</html>"),
    });

    const result = await uploadRequest("image/upload", new FormData());

    expect(result).toEqual({
      ok: false,
      error: { message: UNEXPECTED_RESPONSE_MESSAGE, status: 0 },
    });
  });

  it("handles network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network request failed"));

    const result = await uploadRequest("image/upload", new FormData());

    expect(result).toEqual({
      ok: false,
      error: { message: "Network request failed", status: 0 },
    });
  });
});
