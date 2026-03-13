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
  // List view
  await page.goto("http://localhost:3000/bottles");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "bottles-list");

  // Create form
  await page.goto("http://localhost:3000/bottles/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "bottles-create");

  // Detail view
  await page.goto("http://localhost:3000/bottles/1");
  await captureScreenshot(page, outputDir, "bottles-detail");

  // Edit form
  await page.goto("http://localhost:3000/bottles/1/edit");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "bottles-edit");
}
