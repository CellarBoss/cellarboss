import { uploadRequest } from "@/lib/api/upload";

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
  default: {
    expoConfig: {
      extra: {
        apiBaseUrl: "http://localhost:5000",
      },
    },
  },
}));

const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

beforeEach(() => {
  mockStore.clear();
  mockFetch.mockReset();
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("uploadRequest", () => {
  it("sends multipart form data with bearer token, without a Content-Type header", async () => {
    mockStore.set("cellarboss_auth_token", "my-token");
    const formData = new FormData();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 1, filename: "a.jpg" })),
    });

    const result = await uploadRequest("images", formData);

    expect(result).toEqual({ ok: true, data: { id: 1, filename: "a.jpg" } });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://cellar.example.com/api/images",
      {
        method: "POST",
        headers: {
          Origin: "https://cellar.example.com",
          Authorization: "Bearer my-token",
        },
        body: formData,
      },
    );
  });

  it("omits Authorization header when no token", async () => {
    const formData = new FormData();

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("null"),
    });

    await uploadRequest("images", formData);

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("processes backend errors", async () => {
    mockStore.set("cellarboss_auth_token", "token");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 413,
      text: () =>
        Promise.resolve(JSON.stringify({ message: "File too large" })),
    });

    const result = await uploadRequest("images", new FormData());

    expect(result).toEqual({
      ok: false,
      error: { message: "File too large", status: 413 },
    });
  });

  it("handles network errors", async () => {
    mockStore.set("cellarboss_auth_token", "token");
    mockFetch.mockRejectedValueOnce(new Error("Network request failed"));

    const result = await uploadRequest("images", new FormData());

    expect(result).toEqual({
      ok: false,
      error: { message: "Network request failed", status: 0 },
    });
  });
});
