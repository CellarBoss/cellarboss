import { defineConfig } from "vitepress";

export default defineConfig({
  title: "CellarBoss",
  description: "User documentation for the CellarBoss wine cellar management application",
  base: "/web/",
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: "User Guide", link: "/guide/" },
      { text: "API Reference", link: "https://docs.cellarboss.org/api/", target: "_self" },
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Overview", link: "/guide/" },
          { text: "Installation", link: "/guide/installation" },
          { text: "Authentication", link: "/guide/authentication" },
          { text: "Dashboard", link: "/guide/dashboard" },
        ],
      },
      {
        text: "Resources",
        items: [
          { text: "Bottles", link: "/resources/bottles" },
          { text: "Wines", link: "/resources/wines" },
          { text: "Winemakers", link: "/resources/winemakers" },
          { text: "Vintages", link: "/resources/vintages" },
          { text: "Countries", link: "/resources/countries" },
          { text: "Regions", link: "/resources/regions" },
          { text: "Grapes", link: "/resources/grapes" },
          { text: "Storages", link: "/resources/storages" },
          { text: "Locations", link: "/resources/locations" },
        ],
      },
      {
        text: "Administration",
        items: [
          { text: "Users", link: "/resources/users" },
          { text: "Settings", link: "/guide/settings" },
          { text: "Profile", link: "/guide/profile" },
        ],
      },
      {
        text: "Features",
        items: [
          { text: "DataTable", link: "/features/datatable" },
          { text: "Storage Hierarchy", link: "/features/storage-hierarchy" },
        ],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/CellarBoss/cellarboss" },
    ],
    search: {
      provider: "local",
    },
  },
});
