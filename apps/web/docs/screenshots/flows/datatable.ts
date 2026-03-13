import type { Page } from "@playwright/test";

type CaptureScreenshot = (
  page: Page,
  outputDir: string,
  name: string,
) => Promise<void>;

/**
 * Captures screenshots for generic DataTable features: search, filters, bulk actions.
 * Uses the bottles page as a representative example.
 */
export async function capture(
  page: Page,
  outputDir: string,
  captureScreenshot: CaptureScreenshot,
) {
  // Search — type in the search box to show filtered results
  await page.goto("http://localhost:3000/bottles");
  await page.waitForSelector("table");
  const searchInput = page.locator("input[type='search']");
  await searchInput.fill("Chateau");
  await page.waitForTimeout(500);
  await captureScreenshot(page, outputDir, "datatable-search");

  // Filter — open a filter popover to show filter options
  await page.goto("http://localhost:3000/bottles");
  await page.waitForSelector("table");
  const filterButton = page.locator("button", { hasText: "Status" });
  await filterButton.click();
  await page.waitForSelector("[data-slot='popover-content']");
  await page.waitForTimeout(300);
  await captureScreenshot(page, outputDir, "datatable-filter");
  // Close popover
  await page.keyboard.press("Escape");

  // Bulk actions — select multiple rows to show the bulk action bar
  await page.goto("http://localhost:3000/bottles");
  await page.waitForSelector("table");
  // Click the "Select all" checkbox in the header
  const selectAll = page.locator("[aria-label='Select all']");
  await selectAll.click();
  await page.waitForTimeout(300);
  await captureScreenshot(page, outputDir, "datatable-bulk");
}
