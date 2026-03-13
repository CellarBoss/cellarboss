import type { Page } from "@playwright/test";

type CaptureScreenshot = (
  page: Page,
  outputDir: string,
  name: string,
) => Promise<void>;

/**
 * Captures screenshots for non-resource pages: dashboard, login, settings, profile.
 */
export async function capture(
  page: Page,
  outputDir: string,
  captureScreenshot: CaptureScreenshot,
) {
  // Login page (clear cookies to show unauthenticated view)
  const cookies = await page.context().cookies();
  await page.context().clearCookies();
  await page.goto("http://localhost:3000/login");
  await captureScreenshot(page, outputDir, "login");
  // Restore cookies for remaining captures
  await page.context().addCookies(cookies);

  // Dashboard
  await page.goto("http://localhost:3000/");
  await captureScreenshot(page, outputDir, "dashboard");

  // Settings list
  await page.goto("http://localhost:3000/settings");
  await captureScreenshot(page, outputDir, "settings");

  // Settings edit form
  await page.goto("http://localhost:3000/settings/currency/edit");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "settings-edit");

  // Profile
  await page.goto("http://localhost:3000/profile");
  await captureScreenshot(page, outputDir, "profile");
}
