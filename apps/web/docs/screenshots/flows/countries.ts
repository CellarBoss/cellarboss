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
  await page.goto("http://localhost:3000/countries");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "countries-list");

  await page.goto("http://localhost:3000/countries/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "countries-create");

  await page.goto("http://localhost:3000/countries/1");
  await captureScreenshot(page, outputDir, "countries-detail");
}
