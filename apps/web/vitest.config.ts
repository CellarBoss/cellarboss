import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/*.test.tsx", "hooks/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      include: ["lib/**/*.ts", "lib/**/*.tsx", "hooks/**/*.ts"],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.d.ts", "lib/api/**"],
    },
  },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
