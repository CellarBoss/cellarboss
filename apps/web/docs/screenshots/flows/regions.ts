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
  await page.goto("http://localhost:3000/regions");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "regions-list");

  await page.goto("http://localhost:3000/regions/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "regions-create");

  await page.goto("http://localhost:3000/regions/1");
  await captureScreenshot(page, outputDir, "regions-detail");
}
