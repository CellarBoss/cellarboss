import { Home, BottleWine, Settings, Grape, CalendarFold, User, Refrigerator, MapPin, Earth, Flag, Barrel, UserCircle } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LogoutButton } from "@/components/sidebar/LogoutButton";

import { authClient } from "@/lib/auth-client";

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
    </Sidebar>
  )
}

/*
export function UserDisplay() {
  const session = authClient.useSession();

  if (!session) return null;

  const user = session.data?.user;
  
  if (!user) return null;
  return (
    <SidebarFooter>
      Hello, {user.name}
      <LogoutButton />
    </SidebarFooter>
  )
}
*/
