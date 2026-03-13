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
  await page.goto("http://localhost:3000/wines");
  await page.waitForSelector("table");
  await captureScreenshot(page, outputDir, "wines-list");

  // Detail row
  await page.goto("http://localhost:3000/wines");
  await page.waitForSelector("table");
  await page.click("[aria-label='Expand row']");
  await captureScreenshot(page, outputDir, "wines-detailrow");

  // Create form
  await page.goto("http://localhost:3000/wines/new");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "wines-create");

  // Detail view
  await page.goto("http://localhost:3000/wines/1");
  await captureScreenshot(page, outputDir, "wines-detail");

  // Edit form
  await page.goto("http://localhost:3000/wines/1/edit");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "wines-edit");
}
