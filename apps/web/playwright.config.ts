import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-results.json" }],
    ["list"],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
  webServer: {
    // Invoke next directly rather than via `pnpm build && pnpm start`: since
    // pnpm 12.6 runs scripts in their own process group, so Playwright's
    // process-group kill on teardown leaves the server running and hangs CI.
    command: "next build && next start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      CELLARBOSS_SERVER: "http://localhost:5173",
      BETTER_AUTH_SECRET: "e2e-test-secret-placeholder",
      BETTER_AUTH_URL: "http://localhost:5173",
    },
  },
});
