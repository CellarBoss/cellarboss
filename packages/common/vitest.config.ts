import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      include: ["src/**/*.ts"],
      exclude: ["src/__tests__/**", "**/*.test.ts", "**/*.d.ts"],
      // Floor a few points below current baseline (~77%) so CI fails on real
      // regressions without tripping on normal fluctuation.
      thresholds: {
        statements: 73,
        branches: 74,
        functions: 78,
        lines: 73,
      },
    },
  },
});
