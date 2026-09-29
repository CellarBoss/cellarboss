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
  // Import form, pre-filled from a canned mock-server page that shows a
  // matched country, a new winemaker and a close match for the region
  await page.goto("http://localhost:3000/wines/import");
  await page
    .getByLabel("Product page link")
    .fill(
      "https://www.thewinesociety.com/product/chateau-petit-bordeaux-superieur-2020",
    );
  await page.getByRole("button", { name: "Get details" }).click();
  await page.waitForSelector("[data-testid='import-field-status']");
  await captureScreenshot(page, outputDir, "wines-import");
}
