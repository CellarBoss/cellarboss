import { test as base, type BrowserContext } from "@playwright/test";

export type SessionRole = "admin" | "user";

// The cookie checked by apps/web/middleware.ts for authentication
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

export const test = base.extend<{
  adminContext: BrowserContext;
  userContext: BrowserContext;
}>({
  adminContext: async ({ browser }, use) => {
    await setMockSession("admin");
    const context = await browser.newContext();
    // Middleware only checks presence of this cookie, not its value
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
    await use(context);
    await context.close();
  },

  userContext: async ({ browser }, use) => {
    await setMockSession("user");
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: SESSION_COOKIE_NAME,
        value: "mock-user-token",
        domain: "localhost",
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      },
    ]);
    await use(context);
    await context.close();
  },
});

export { expect } from "@playwright/test";

export const MOCK_SERVER = MOCK_SERVER_URL;

export async function setState(partial: Record<string, any>) {
  await fetch(`${MOCK_SERVER_URL}/__test/set-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
}

export async function resetState() {
  await fetch(`${MOCK_SERVER_URL}/__test/reset`, { method: "POST" });
}
