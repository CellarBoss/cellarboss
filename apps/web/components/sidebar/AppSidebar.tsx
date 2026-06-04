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
  type LucideIcon,
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
import { useI18n } from "@/contexts/i18n-context";
import type { TranslationKey } from "@cellarboss/common/i18n";

type SidebarItem = {
  titleKey: TranslationKey;
  url: string;
  icon: LucideIcon;
};

const wineItems = [
  { titleKey: "nav.bottles", url: "/bottles", icon: BottleWine },
  { titleKey: "nav.wines", url: "/wines", icon: Barrel },
  {
    titleKey: "nav.tastingNotes",
    url: "/tasting-notes",
    icon: ClipboardList,
  },
  { titleKey: "nav.grapes", url: "/grapes", icon: Grape },
  { titleKey: "nav.winemakers", url: "/winemakers", icon: User },
] satisfies SidebarItem[];

const storageItems = [
  { titleKey: "nav.storages", url: "/storages", icon: Refrigerator },
  { titleKey: "nav.locations", url: "/locations", icon: MapPin },
] satisfies SidebarItem[];

const geographyItems = [
  { titleKey: "nav.regions", url: "/regions", icon: Flag },
  { titleKey: "nav.countries", url: "/countries", icon: Earth },
] satisfies SidebarItem[];

const settingsItems = [
  { titleKey: "nav.profile", url: "/profile", icon: UserCircle },
  {
    titleKey: "nav.applicationSettings",
    url: "/settings",
    icon: Settings,
  },
] satisfies SidebarItem[];

const adminItems = [
  { titleKey: "nav.users", url: "/users", icon: Users },
] satisfies SidebarItem[];

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
  const { t } = useI18n();
  const session = authClient.useSession();
  const user = session.data?.user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await fetch("/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const sections = [
    { labelKey: "section.wineData", items: wineItems },
    { labelKey: "section.storage", items: storageItems },
    { labelKey: "section.geography", items: geographyItems },
    {
      labelKey: "nav.settings",
      items: isAdmin ? [...settingsItems, ...adminItems] : settingsItems,
    },
  ] satisfies { labelKey: TranslationKey; items: SidebarItem[] }[];

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
                {t("app.name")}
              </span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" hidden={state !== "collapsed"}>
            {t("nav.dashboard")}
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>
      <SidebarContent>
        {sections.map(({ labelKey, items }) => (
          <SidebarGroup key={labelKey}>
            <SidebarGroupLabel>{t(labelKey)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.titleKey}>
                    <SidebarMenuButton asChild tooltip={t(item.titleKey)}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{t(item.titleKey)}</span>
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
                  aria-label="User menu"
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
                    {t("action.toggleTheme")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSidebar()}>
                    {state === "expanded" ? (
                      <>
                        <PanelLeftClose className="size-4" />
                        {t("action.collapseSidebar")}
                      </>
                    ) : (
                      <>
                        <PanelLeftOpen className="size-4" />
                        {t("action.expandSidebar")}
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <a href="/profile">
                      <UserCircle className="size-4" />
                      {t("nav.profile")}
                    </a>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <a href="/settings">
                        <Settings className="size-4" />
                        {t("nav.settings")}
                      </a>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4" />
                  {t("action.logOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
