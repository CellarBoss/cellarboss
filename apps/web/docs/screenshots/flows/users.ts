import type { Page } from "@playwright/test";

type CaptureScreenshot = (
  page: Page,
  outputDir: string,
  name: string,
) => Promise<void>;

export async function capture(
  page: Page,
  outputDir: string,
  captureScreenshot: CaptureScreenshot,
) {
  await page.goto("http://localhost:3000/users");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "users-list");

  await page.goto("http://localhost:3000/users/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "users-create");

  await page.goto("http://localhost:3000/users/admin-user-1");
  await captureScreenshot(page, outputDir, "users-detail");
}
