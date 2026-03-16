"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { ReactNode, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";

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
          <SidebarProvider defaultOpen={sidebarDefaultOpen}>
            {children}
          </SidebarProvider>
        </QueryClientProvider>
      </NuqsAdapter>
    </ThemeProvider>
  );
}
