"use client";

import Link from "next/link";
import { BottleWine } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function MobileHeader() {
  return (
    <div className="flex items-center gap-2 mb-4 md:hidden">
      <SidebarTrigger />
      <Link href="/" className="flex items-center gap-1 font-semibold text-lg">
        <BottleWine className="h-5 w-5" />
        CellarBoss
      </Link>
    </div>
  );
}
