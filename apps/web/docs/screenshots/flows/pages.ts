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
  // Dashboard
  await page.goto("http://localhost:3000/");
  await captureScreenshot(page, outputDir, "dashboard");

  // Settings
  await page.goto("http://localhost:3000/settings");
  await captureScreenshot(page, outputDir, "settings");

  // Profile
  await page.goto("http://localhost:3000/profile");
  await captureScreenshot(page, outputDir, "profile");
}
