import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { mockOk } from "../helpers/mock-api";

// Mock the api client
const mockGetAll = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/lib/api/client", () => ({
  api: {
    settings: {
      getAll: () => mockGetAll(),
      update: (key: string, value: string) => mockUpdate(key, value),
    },
  },
}));

// Import after mock
import { useSettings, useSetting } from "@/hooks/use-settings";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a Map of settings", async () => {
    mockGetAll.mockResolvedValue(
      mockOk([
        { key: "currency", value: "USD" },
        { key: "dateFormat", value: "yyyy-MM-dd" },
      ]),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSettings(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeInstanceOf(Map);
    expect(result.current.data?.get("currency")).toBe("USD");
    expect(result.current.data?.get("dateFormat")).toBe("yyyy-MM-dd");
  });
});

describe("useSetting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a single setting value", async () => {
    mockGetAll.mockResolvedValue(
      mockOk([
        { key: "currency", value: "EUR" },
        { key: "dateFormat", value: "dd/MM/yyyy" },
      ]),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSetting("currency"), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe("EUR");
  });
});
