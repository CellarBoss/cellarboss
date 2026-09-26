// Mock secure store
import { getApiBaseUrl } from "@/lib/api/base-url";

const mockGetServerUrl = jest.fn();
jest.mock("@/lib/auth/secure-store", () => ({
  getServerUrl: () => mockGetServerUrl(),
}));

// Mock env (read lazily so each test can change it)
const DEFAULT_ENV_URL = "http://localhost:5000";
const mockEnv: { apiBaseUrl?: string } = { apiBaseUrl: DEFAULT_ENV_URL };
jest.mock("@/lib/env", () => ({
  get mobileEnv() {
    return mockEnv;
  },
}));

describe("getApiBaseUrl", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.apiBaseUrl = DEFAULT_ENV_URL;
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
    mockEnv.apiBaseUrl = undefined;

    const result = await getApiBaseUrl();
    expect(result).toBeNull();
  });
});
