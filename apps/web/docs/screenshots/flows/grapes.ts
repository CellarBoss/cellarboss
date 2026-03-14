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
  await page.goto("http://localhost:3000/grapes");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "grapes-list");

  await page.goto("http://localhost:3000/grapes/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "grapes-create");

  await page.goto("http://localhost:3000/grapes/1");
  await captureScreenshot(page, outputDir, "grapes-detail");
}
