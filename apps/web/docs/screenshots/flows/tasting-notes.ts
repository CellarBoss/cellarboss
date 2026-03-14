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
  await page.goto("http://localhost:3000/tasting-notes");
  await page.waitForSelector("section");
  await captureScreenshot(page, outputDir, "tasting-notes-list");

  // Create form
  await page.goto("http://localhost:3000/tasting-notes/new?vintageId=1");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "tasting-notes-create");

  // Edit form
  await page.goto("http://localhost:3000/tasting-notes/1/edit");
  await page.waitForSelector("form");
  await captureScreenshot(page, outputDir, "tasting-notes-edit");
}
