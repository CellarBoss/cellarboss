import { type ReactElement, type ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PaperProvider } from "react-native-paper";
import { lightTheme } from "@/lib/theme";
import { ThemePreferenceProvider } from "@/contexts/theme-context";
import { NavigationHistoryProvider } from "@/contexts/navigation-history-context";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient();

  return (
    <ThemePreferenceProvider>
      <PaperProvider theme={lightTheme}>
        <QueryClientProvider client={queryClient}>
          <NavigationHistoryProvider>{children}</NavigationHistoryProvider>
        </QueryClientProvider>
      </PaperProvider>
    </ThemePreferenceProvider>
  );
}

function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { renderWithProviders };
export * from "@testing-library/react-native";
export { createTestQueryClient };
