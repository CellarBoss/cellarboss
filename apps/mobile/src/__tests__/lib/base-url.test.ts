// Mock secure store
const mockGetServerUrl = jest.fn();
jest.mock("@/lib/auth/secure-store", () => ({
  getServerUrl: () => mockGetServerUrl(),
}));

// Mock env
jest.mock("@/lib/env", () => ({
  mobileEnv: { apiBaseUrl: "http://localhost:5000" },
}));

import { getApiBaseUrl } from "@/lib/api/base-url";

describe("getApiBaseUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns stored URL when present", async () => {
    mockGetServerUrl.mockResolvedValue("https://cellar.example.com");
    const result = await getApiBaseUrl();
    expect(result).toBe("https://cellar.example.com");
  });

  it("falls back to env URL when no stored URL", async () => {
    mockGetServerUrl.mockResolvedValue(null);
    const result = await getApiBaseUrl();
    expect(result).toBe("http://localhost:5000");
  });

  it("returns null when neither stored nor env URL exists", async () => {
    mockGetServerUrl.mockResolvedValue(null);

    // Re-mock env with no URL
    jest.resetModules();
    jest.mock("@/lib/auth/secure-store", () => ({
      getServerUrl: () => Promise.resolve(null),
    }));
    jest.mock("@/lib/env", () => ({
      mobileEnv: { apiBaseUrl: undefined },
    }));

    const { getApiBaseUrl: freshGetApiBaseUrl } = require("@/lib/api/base-url");
    const result = await freshGetApiBaseUrl();
    expect(result).toBeNull();
  });
});
