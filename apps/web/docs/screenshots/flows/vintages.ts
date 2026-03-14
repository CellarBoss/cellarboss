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
  // Vintages have no list page — they are accessed via wine detail pages
  await page.goto("http://localhost:3000/vintages/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "vintages-create");

  await page.goto("http://localhost:3000/vintages/1");
  await captureScreenshot(page, outputDir, "vintages-detail");
}
