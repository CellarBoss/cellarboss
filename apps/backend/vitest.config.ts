import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/tests/env-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/tests/**",
        "**/*.test.ts",
        "**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@controllers": path.resolve(__dirname, "./src/controllers"),
      "@middleware": path.resolve(__dirname, "./src/middleware"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@schema": path.resolve(__dirname, "./src/schema"),
      "@db": path.resolve(__dirname, "./src/utils/database.ts"),
      "@cellarboss/types": path.resolve(
        __dirname,
        "../../packages/types/src/index.ts",
      ),
      "@cellarboss/validators": path.resolve(
        __dirname,
        "../../packages/validators/src/index.ts",
      ),
    },
  },
});
