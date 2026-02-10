import type { Metadata } from "next";
import "./globals.css";
import { SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/AppSidebar"
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
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
