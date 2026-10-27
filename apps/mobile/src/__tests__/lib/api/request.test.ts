import {
  makeRequest,
  parseResponseBody,
  UNEXPECTED_RESPONSE_MESSAGE,
} from "@/lib/api/request";
import { clearAuthStorage } from "@/lib/auth/auth-client";
import { SESSION_COOKIE, STORED_SESSION } from "../../helpers/responses";

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

beforeEach(async () => {
  await clearAuthStorage();
  mockStore.clear();
  mockFetch.mockReset();
  mockStore.set("cellarboss_server_url", "https://cellar.example.com");
});

describe("makeRequest", () => {
  it("sends GET request with the session cookie", async () => {
    mockStore.set("cellarboss_cookie", STORED_SESSION);

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
          Cookie: SESSION_COOKIE,
        },
        credentials: "omit",
      }),
    );
  });

  it("sends POST request with body", async () => {
    mockStore.set("cellarboss_cookie", STORED_SESSION);
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

  it("omits the Cookie header when signed out", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("null"),
    });

    await makeRequest("wines", "GET");

    const headers = mockFetch.mock.calls[0][1].headers;
    expect(headers).not.toHaveProperty("Cookie");
    expect(headers).not.toHaveProperty("Authorization");
  });

  it("processes validation errors from backend", async () => {
    mockStore.set("cellarboss_cookie", STORED_SESSION);

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
    mockStore.set("cellarboss_cookie", STORED_SESSION);

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
    mockStore.set("cellarboss_cookie", STORED_SESSION);

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

  it("returns a readable error for a non-JSON response", async () => {
    mockStore.set("cellarboss_cookie", STORED_SESSION);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve("<!DOCTYPE html><html></html>"),
    });

    const result = await makeRequest("wines", "GET");

    expect(result).toEqual({
      ok: false,
      error: { message: UNEXPECTED_RESPONSE_MESSAGE, status: 0 },
    });
  });

  it("returns a readable error for a non-JSON error response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: () => Promise.resolve("<html>Bad Gateway</html>"),
    });

    const result = await makeRequest("wines", "GET");

    expect(result).toEqual({
      ok: false,
      error: { message: UNEXPECTED_RESPONSE_MESSAGE, status: 0 },
    });
  });
});

describe("parseResponseBody", () => {
  it("parses JSON", () => {
    expect(parseResponseBody('{"id":1}')).toEqual({ id: 1 });
  });

  it("returns null for an empty body", () => {
    expect(parseResponseBody("")).toBeNull();
  });

  it("throws a readable error for HTML", () => {
    expect(() => parseResponseBody("<html></html>")).toThrow(
      UNEXPECTED_RESPONSE_MESSAGE,
    );
  });
});
