import { test, expect } from "@playwright/test";
import { setMockSession } from "../fixtures/auth";

const SESSION_COOKIE_NAME = "better-auth.session_token";

test.describe("Authentication", () => {
  test("redirects unauthenticated user to login page", async ({ page }) => {
    await page.goto("/wines");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page has correct elements", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Sign in to CellarBoss" }),
    ).toBeVisible();
    await expect(page.getByText("Username")).toBeVisible();
    await expect(page.getByText("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("preserves callbackUrl when redirecting to login", async ({ page }) => {
    await page.goto("/wines");
    await expect(page).toHaveURL(/callbackUrl=%2Fwines/);
  });

  test("redirects to root by default when no callbackUrl", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("authenticated user can access protected page", async ({ browser }) => {
    await setMockSession("admin");
    const context = await browser.newContext();
    await context.addCookies([
      {
        name: SESSION_COOKIE_NAME,
        value: "any-value-middleware-checks-presence-only",
        domain: "localhost",
        path: "/",
      },
    ]);
    const page = await context.newPage();
    await page.goto("/wines");
    await expect(page).not.toHaveURL(/\/login/);
    await context.close();
  });
});
