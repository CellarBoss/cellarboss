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
  await page.goto("http://localhost:3000/locations");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "locations-list");

  await page.goto("http://localhost:3000/locations/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "locations-create");

  await page.goto("http://localhost:3000/locations/1");
  await captureScreenshot(page, outputDir, "locations-detail");
}
