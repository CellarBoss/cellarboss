import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { LoadingCard } from "@/components/cards/LoadingCard";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "CellarBoss",
  description: "Your open source wine cellar inventory manager.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 p-6 md:p-10 bg-gray-100">
              <div className="w-full bg-white shadow-sm rounded-lg p-6 md:p-10">
                <Suspense fallback={<LoadingCard />}>{children}</Suspense>
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
