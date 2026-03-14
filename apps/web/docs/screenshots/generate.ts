import { chromium, type Page, type BrowserContext } from "@playwright/test";
import { startMockServer, stopMockServer } from "../../e2e/mock-server/index";
import { docsSeedData } from "./seed-data";
import { join, resolve } from "path";
import { mkdirSync } from "fs";
import { spawn, type ChildProcess } from "child_process";

const MOCK_SERVER_PORT = 5173;
const MOCK_SERVER_URL = `http://localhost:${MOCK_SERVER_PORT}`;
const WEB_SERVER_URL = "http://localhost:3000";
const VIEWPORT = { width: 1280, height: 720 };
const OUTPUT_DIR = resolve(__dirname, "../public/screenshots");

const SESSION_COOKIE_NAME = "better-auth.session_token";

async function seedData() {
  // Set session
  await fetch(`${MOCK_SERVER_URL}/__test/set-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: {
        id: "admin-user-1",
        name: "Admin User",
        email: "admin@cellarboss.test",
        role: "admin",
      },
      session: {
        id: "session-admin-1",
        token: "token-admin",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    }),
  });

  // Set state with rich docs data
  await fetch(`${MOCK_SERVER_URL}/__test/set-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(docsSeedData),
  });
}

async function createAuthenticatedContext(
  browser: ReturnType<(typeof chromium)["launch"]> extends Promise<infer T>
    ? T
    : never,
): Promise<BrowserContext> {
  const context = await browser.newContext({ viewport: VIEWPORT });
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: "mock-admin-token",
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  return context;
}

function waitForServer(url: string, timeoutMs = 60_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = async () => {
      try {
        await fetch(url);
        resolve();
      } catch {
        if (Date.now() - start > timeoutMs) {
          reject(
            new Error(`Server at ${url} did not start within ${timeoutMs}ms`),
          );
        } else {
          setTimeout(check, 500);
        }
      }
    };
    check();
  });
}

function startNextDev(): ChildProcess {
  const child = spawn("pnpm", ["dev"], {
    cwd: resolve(__dirname, "../.."),
    env: {
      ...process.env,
      CELLARBOSS_SERVER: MOCK_SERVER_URL,
      BETTER_AUTH_SECRET: "docs-screenshot-secret",
      BETTER_AUTH_URL: MOCK_SERVER_URL,
    },
    stdio: "pipe",
    shell: true,
  });
  child.stdout?.on("data", (d) => process.stdout.write(`[next] ${d}`));
  child.stderr?.on("data", (d) => process.stderr.write(`[next] ${d}`));
  return child;
}

async function captureScreenshot(page: Page, path: string, name: string) {
  const fullPath = join(path, `${name}.png`);
  await page.waitForLoadState("networkidle");
  // Small delay for animations to settle
  await page.waitForTimeout(300);
  await page.screenshot({ path: fullPath, fullPage: false });
  console.log(`  ✓ ${name}`);
}

import { capture as captureBottles } from "./flows/bottles";
import { capture as captureCountries } from "./flows/countries";
import { capture as captureDatatable } from "./flows/datatable";
import { capture as captureGrapes } from "./flows/grapes";
import { capture as captureLocations } from "./flows/locations";
import { capture as capturePages } from "./flows/pages";
import { capture as captureRegions } from "./flows/regions";
import { capture as captureStorages } from "./flows/storages";
import { capture as captureUsers } from "./flows/users";
import { capture as captureVintages } from "./flows/vintages";
import { capture as captureWinemakers } from "./flows/winemakers";
import { capture as captureTastingNotes } from "./flows/tasting-notes";
import { capture as captureWines } from "./flows/wines";

type CaptureScreenshot = typeof captureScreenshot;
type FlowFn = (
  page: Page,
  outputDir: string,
  cs: CaptureScreenshot,
) => Promise<void>;

const flows: Array<{ name: string; capture: FlowFn }> = [
  { name: "bottles", capture: captureBottles },
  { name: "countries", capture: captureCountries },
  { name: "datatable", capture: captureDatatable },
  { name: "grapes", capture: captureGrapes },
  { name: "locations", capture: captureLocations },
  { name: "pages", capture: capturePages },
  { name: "regions", capture: captureRegions },
  { name: "storages", capture: captureStorages },
  { name: "tasting-notes", capture: captureTastingNotes },
  { name: "users", capture: captureUsers },
  { name: "vintages", capture: captureVintages },
  { name: "winemakers", capture: captureWinemakers },
  { name: "wines", capture: captureWines },
];

async function main() {
  console.log("📸 Generating documentation screenshots...\n");

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // 1. Start mock server
  console.log("Starting mock server...");
  await startMockServer(MOCK_SERVER_PORT);

  // 2. Seed data
  console.log("Seeding documentation data...");
  await seedData();

  // 3. Start Next.js dev server
  console.log("Starting Next.js dev server...");
  const nextProcess = startNextDev();

  try {
    // 4. Wait for Next.js to be ready
    console.log("Waiting for Next.js...");
    await waitForServer(WEB_SERVER_URL);
    console.log("Next.js is ready.\n");

    // 5. Launch browser
    const browser = await chromium.launch();
    const context = await createAuthenticatedContext(browser);
    const page = await context.newPage();

    // Warm up: visit dashboard to establish the client-side session cache
    // (authClient.useSession() fetches /api/auth/get-session on first load)
    await page.goto(WEB_SERVER_URL);
    await page.waitForLoadState("networkidle");

    // 6. Run screenshot flows
    for (const flow of flows) {
      console.log(`\n📄 ${flow.name}:`);
      // Reset and re-seed between flows for clean state
      await fetch(`${MOCK_SERVER_URL}/__test/reset`, { method: "POST" });
      await seedData();
      await flow.capture(page, OUTPUT_DIR, captureScreenshot);
    }

    // 7. Cleanup
    await context.close();
    await browser.close();

    console.log(`\n✅ Screenshots saved to ${OUTPUT_DIR}`);
  } finally {
    await stopMockServer();
    nextProcess.kill();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Screenshot generation failed:", err);
  process.exit(1);
});
