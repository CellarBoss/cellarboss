"use client";

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
  PanelLeftClose,
  PanelLeftOpen,
  ChevronsUpDown,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppSidebar() {
  const { toggleSidebar, state, isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
  const session = authClient.useSession();
  const user = session.data?.user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/login";
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 px-2 py-3 font-semibold text-xl tracking-tight hover:opacity-80 transition-opacity"
            >
              <BottleWine className="h-5 w-5 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">
                CellarBoss
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" hidden={state !== "collapsed"}>
            Dashboard
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>
      <SidebarContent>
        {sections.map(({ label, items }) => (
          <SidebarGroup key={label}>
            <SidebarGroupLabel>{label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
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
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user?.name || user?.email || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user?.name}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {getInitials(user?.name || user?.email || "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user?.name}</span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="size-4" />
                    ) : (
                      <Moon className="size-4" />
                    )}
                    Toggle theme
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSidebar()}>
                    {state === "expanded" ? (
                      <>
                        <PanelLeftClose className="size-4" />
                        Collapse sidebar
                      </>
                    ) : (
                      <>
                        <PanelLeftOpen className="size-4" />
                        Expand sidebar
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <a href="/profile">
                      <UserCircle className="size-4" />
                      Profile
                    </a>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <a href="/settings">
                        <Settings className="size-4" />
                        Settings
                      </a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
