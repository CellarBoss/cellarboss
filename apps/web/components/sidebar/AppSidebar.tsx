"use client";

import { BottleWine, Settings, Grape, User, Refrigerator, MapPin, Earth, Flag, Barrel, UserCircle, LogOut } from "lucide-react"
import { authClient } from "@/lib/auth-client"

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
} from "@/components/ui/sidebar"

const menuItems = {
  "Wines": [
    { title: "Bottles", url: "/bottles", icon: BottleWine },
    { title: "Wines", url: "/wines", icon: Barrel },
    { title: "Grapes", url: "/grapes", icon: Grape },
    { title: "Winemakers", url: "/winemakers", icon: User },
  ],
  "Storage": [
    { title: "Storages", url: "/storages", icon: Refrigerator },
    { title: "Locations", url: "/locations", icon: MapPin },
  ],
  "Geography": [
    { title: "Regions", url: "/regions", icon: Flag },
    { title: "Countries", url: "/countries", icon: Earth },
  ],
  "Settings": [
    { title: "Profile", url: "/profile", icon: UserCircle },
    { title: "Users", url: "/users", icon: User },
    { title: "Application Settings", url: "/settings", icon: Settings },
  ]
}

export function AppSidebar() {
  const session = authClient.useSession();
  const user = session.data?.user;

  return (
    <Sidebar>
      <SidebarHeader><a href="/">CellarBoss</a></SidebarHeader>
      <SidebarContent>
        {Object.entries(menuItems).map(([section, items]) => (
          <SidebarGroup key={section}>
            <SidebarGroupLabel>{section}</SidebarGroupLabel>
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
            <span className="truncate text-muted-foreground">{user?.name || user?.email}</span>
          </div>
          <a href="/logout" className="flex items-center gap-1 text-muted-foreground hover:text-foreground shrink-0 ml-2" title="Log out">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </a>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
