import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vitepress";

function screenshotPlaceholder(): Plugin {
  const docsDir = path.resolve(__dirname, "..");
  return {
    name: "screenshot-placeholder",
    resolveId(source) {
      if (source.startsWith("/screenshots/")) {
        const filePath = path.join(docsDir, "public", source);
        if (!fs.existsSync(filePath)) {
          return `\0placeholder:${source}`;
        }
      }
    },
    load(id) {
      if (id.startsWith("\0placeholder:")) {
        // 1x1 transparent PNG as data URI
        return `export default "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQABNjN9GQAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAA0lEQVQI12P4z8BQDwAEgAF/QualzQAAAABJRU5ErkJggg=="`;
      }
    },
  };
}

export default defineConfig({
  title: "CellarBoss",
  description: "User documentation for the CellarBoss wine cellar management application",
  base: "/web/",
  ignoreDeadLinks: true,
  vite: {
    plugins: [screenshotPlaceholder()],
  },
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
