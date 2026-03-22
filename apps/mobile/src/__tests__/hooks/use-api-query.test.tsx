import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { ApiQueryError } from "@cellarboss/common";
import { mockOk, mockError } from "../helpers/mock-api";

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

describe("useApiQuery", () => {
  it("unwraps successful ApiResult to data", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ["test-ok"],
          queryFn: async () => mockOk([{ id: 1, name: "Wine" }]),
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([{ id: 1, name: "Wine" }]);
  });

  it("throws ApiQueryError on ok: false response", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ["test-error"],
          queryFn: async () => mockError("Not found", 404),
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(ApiQueryError);
    expect(result.current.error?.message).toBe("Not found");
  });
});
