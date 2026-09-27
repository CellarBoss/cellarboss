import {
  test as base,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import type { MockState } from "@cellarboss/mock-server";

export type SessionRole = "admin" | "user";

// The cookie checked by apps/web/proxy.ts for authentication
const SESSION_COOKIE_NAME = "better-auth.session_token";
const MOCK_SERVER_URL = "http://localhost:5173";

export async function setMockSession(role: SessionRole) {
  const session = {
    user: {
      id: role === "admin" ? "admin-user-1" : "regular-user-1",
      name: role === "admin" ? "Test Admin" : "Test User",
      email:
        role === "admin" ? "admin@cellarboss.test" : "user@cellarboss.test",
      role,
    },
    session: {
      id: `session-${role}-1`,
      token: `token-${role}`,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
  };

  await fetch(`${MOCK_SERVER_URL}/__test/set-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
}

/**
 * Opens a browser context signed in as the given role. The mock server holds
 * the session, and the proxy only checks that the cookie is present, so its
 * value is arbitrary.
 */
export async function newSignedInContext(
  browser: Browser,
  role: SessionRole,
): Promise<BrowserContext> {
  await setMockSession(role);
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: SESSION_COOKIE_NAME,
      value: `mock-${role}-token`,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  return context;
}

// Fixture callbacks name Playwright's "provide the value" argument `provide`
// rather than the conventional `use`, which the React hooks lint rules would
// otherwise mistake for React's use() hook.
export const test = base.extend<{
  adminContext: BrowserContext;
  userContext: BrowserContext;
  adminPage: Page;
  userPage: Page;
  resetMockState: void;
}>({
  // Every test starts from the mock server's default data, whatever the test
  // before it seeded or changed
  resetMockState: [
    async ({}, provide) => {
      await provide();
      await resetState();
    },
    { auto: true },
  ],

  adminContext: async ({ browser }, provide) => {
    const context = await newSignedInContext(browser, "admin");
    await provide(context);
    await context.close();
  },

  userContext: async ({ browser }, provide) => {
    const context = await newSignedInContext(browser, "user");
    await provide(context);
    await context.close();
  },

  adminPage: async ({ adminContext }, provide) => {
    await provide(await adminContext.newPage());
  },

  userPage: async ({ userContext }, provide) => {
    await provide(await userContext.newPage());
  },
});

export { expect } from "@playwright/test";

export const MOCK_SERVER = MOCK_SERVER_URL;

export async function setState(partial: Record<string, unknown>) {
  await fetch(`${MOCK_SERVER_URL}/__test/set-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
}

export async function resetState() {
  await fetch(`${MOCK_SERVER_URL}/__test/reset`, { method: "POST" });
}

export async function getState<T = MockState>(): Promise<T> {
  const res = await fetch(`${MOCK_SERVER_URL}/__test/state`);
  return (await res.json()) as T;
}
