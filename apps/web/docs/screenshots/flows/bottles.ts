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

  // Filtered view — open a filter popover and select an option
  await page.goto("http://localhost:3000/bottles");
  await page.waitForSelector("table");
  // Click the Status filter button to open its popover
  const filterButton = page.locator("button", { hasText: "Status" });
  await filterButton.click();
  await page.waitForSelector("[data-slot='popover-content']");
  // Select the first checkbox option in the popover
  const filterCheckbox = page
    .locator("[data-slot='popover-content'] button[role='checkbox']")
    .first();
  await filterCheckbox.click();
  // Close popover by pressing Escape
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  await captureScreenshot(page, outputDir, "bottles-filter");

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
