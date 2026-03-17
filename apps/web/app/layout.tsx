import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import "./globals.css";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { MobileHeader } from "@/components/sidebar/MobileHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "CellarBoss",
  description: "Your open source wine cellar inventory manager.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <Providers sidebarDefaultOpen={sidebarOpen}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 p-4 md:p-10 bg-muted">
              <MobileHeader />
              <div className="w-full bg-card shadow-sm rounded-lg p-4 md:p-10">
                <Suspense fallback={<LoadingCard />}>{children}</Suspense>
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
