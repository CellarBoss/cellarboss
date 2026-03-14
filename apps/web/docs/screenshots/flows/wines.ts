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

  // Filtered view — open a filter popover and select an option
  await page.goto("http://localhost:3000/wines");
  await page.waitForSelector("table");
  const filterButton = page.locator("button", { hasText: "Type" });
  await filterButton.click();
  await page.waitForSelector("[data-slot='popover-content']");
  const filterCheckbox = page
    .locator("[data-slot='popover-content'] button[role='checkbox']")
    .first();
  await filterCheckbox.click();
  // Close popover by pressing Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await captureScreenshot(page, outputDir, "wines-filter");

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
