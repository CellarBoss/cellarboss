"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BottleWine,
  ClipboardList,
  Settings,
  Grape,
  User,
  Refrigerator,
  MapPin,
  Earth,
  Flag,
  Barrel,
  UserCircle,
  LogOut,
  Users,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const wineItems = [
  { title: "Bottles", url: "/bottles", icon: BottleWine },
  { title: "Wines", url: "/wines", icon: Barrel },
  { title: "Tasting Notes", url: "/tasting-notes", icon: ClipboardList },
  { title: "Grapes", url: "/grapes", icon: Grape },
  { title: "Winemakers", url: "/winemakers", icon: User },
];

const storageItems = [
  { title: "Storages", url: "/storages", icon: Refrigerator },
  { title: "Locations", url: "/locations", icon: MapPin },
];

const geographyItems = [
  { title: "Regions", url: "/regions", icon: Flag },
  { title: "Countries", url: "/countries", icon: Earth },
];

const settingsItems = [
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Application Settings", url: "/settings", icon: Settings },
];

const adminItems = [{ title: "Users", url: "/users", icon: Users }];

export function AppSidebar() {
  const router = useRouter();
  const session = authClient.useSession();
  const user = session.data?.user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    router.push("/login");
  };

  const sections = [
    { label: "Wines", items: wineItems },
    { label: "Storage", items: storageItems },
    { label: "Geography", items: geographyItems },
    {
      label: "Settings",
      items: isAdmin ? [...settingsItems, ...adminItems] : settingsItems,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-2 py-3 font-semibold text-xl tracking-tight hover:opacity-80 transition-opacity"
        >
          <BottleWine className="h-5 w-5 shrink-0" />
          <span>CellarBoss</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {sections.map(({ label, items }) => (
          <SidebarGroup key={label}>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-2 py-2 text-sm">
          <div className="flex items-center gap-2 min-w-0">
            <UserCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="truncate text-muted-foreground">
              {user?.name || user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground shrink-0 ml-2"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
