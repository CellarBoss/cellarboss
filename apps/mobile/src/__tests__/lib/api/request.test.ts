import { makeRequest } from "@/lib/api/request";

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
(globalThis as any).fetch = mockFetch;

beforeEach(() => {
  mockStore.clear();
  mockFetch.mockReset();
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("makeRequest", () => {
  it("sends GET request with bearer token", async () => {
    mockStore.set("cellarboss_auth_token", "my-token");

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify([{ id: 1, name: "Wine" }])),
    });

    const result = await makeRequest("wines", "GET");

    expect(result).toEqual({ ok: true, data: [{ id: 1, name: "Wine" }] });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://cellar.example.com/api/wines",
      expect.objectContaining({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://cellar.example.com",
          Authorization: "Bearer my-token",
        },
      }),
    );
  });

  it("sends POST request with body", async () => {
    mockStore.set("cellarboss_auth_token", "my-token");
    const body = JSON.stringify({ name: "New Wine" });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ id: 2, name: "New Wine" })),
    });

    const result = await makeRequest("wines", "POST", body);

    expect(result).toEqual({ ok: true, data: { id: 2, name: "New Wine" } });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://cellar.example.com/api/wines",
      expect.objectContaining({
        method: "POST",
        body,
      }),
    );
  });

  it("omits Authorization header when no token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("null"),
    });

    await makeRequest("wines", "GET");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("processes validation errors from backend", async () => {
    mockStore.set("cellarboss_auth_token", "token");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            errors: [
              { path: "name", msg: "Name is required" },
              { path: "type", msg: "Invalid wine type" },
            ],
          }),
        ),
    });

    const result = await makeRequest("wines", "POST", "{}");

    expect(result).toEqual({
      ok: false,
      error: {
        message: "Input validation failed",
        errors: {
          name: "Name is required",
          type: "Invalid wine type",
        },
        status: 422,
      },
    });
  });

  it("processes general backend errors", async () => {
    mockStore.set("cellarboss_auth_token", "token");

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: () =>
        Promise.resolve(JSON.stringify({ message: "Wine not found" })),
    });

    const result = await makeRequest("wines/999", "GET");

    expect(result).toEqual({
      ok: false,
      error: {
        message: "Wine not found",
        status: 404,
      },
    });
  });

  it("handles network errors", async () => {
    mockStore.set("cellarboss_auth_token", "token");

    mockFetch.mockRejectedValueOnce(new Error("Network request failed"));

    const result = await makeRequest("wines", "GET");

    expect(result).toEqual({
      ok: false,
      error: {
        message: "Network request failed",
        status: 0,
      },
    });
  });
});
