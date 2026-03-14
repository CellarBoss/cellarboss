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
  await page.goto("http://localhost:3000/storages");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "storages-list");

  // Also capture the hierarchy display
  await captureScreenshot(page, outputDir, "storage-hierarchy");

  await page.goto("http://localhost:3000/storages/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "storages-create");

  await page.goto("http://localhost:3000/storages/5");
  await captureScreenshot(page, outputDir, "storages-detail");
}
