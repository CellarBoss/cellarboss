"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SettingsProvider } from "@/contexts/settings-context";
import { I18nProvider } from "@/contexts/i18n-context";

export default function Providers({
  children,
  sidebarDefaultOpen,
}: {
  children: ReactNode;
  sidebarDefaultOpen: boolean;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NuqsAdapter>
        <QueryClientProvider client={queryClient}>
          <SettingsProvider>
            <I18nProvider>
              <SidebarProvider defaultOpen={sidebarDefaultOpen}>
                {children}
              </SidebarProvider>
            </I18nProvider>
          </SettingsProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
