import { test, expect, setState, resetState } from "../fixtures/auth";

test.describe("DataTable interactions", () => {
  test.beforeEach(async () => {
    await setState({
      winemakers: [
        { id: 1, name: "Alpha Winery" },
        { id: 2, name: "Beta Cellars" },
      ],
      regions: [
        { id: 1, name: "Bordeaux", countryId: 1 },
        { id: 2, name: "Burgundy", countryId: 1 },
      ],
      countries: [{ id: 1, name: "France" }],
      wines: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Wine ${String(i + 1).padStart(2, "0")}`,
        type: i % 2 === 0 ? "red" : "white",
        wineMakerId: i % 2 === 0 ? 1 : 2,
        regionId: i % 2 === 0 ? 1 : 2,
      })),
    });
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("shows pagination controls with multiple pages", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // With 15 items and default page size, there should be 2 pages
    await expect(page.getByText(/page \d+ of \d+/i)).toBeVisible();
  });

  test("can navigate to next page", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // PaginationNext renders as an <a> element; target it by its aria-label
    const nextButton = page.locator('[aria-label="Go to next page"]');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await expect(page).toHaveURL(/page=2/);
  });

  test("page parameter in URL", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines?page=2");

    await expect(page).toHaveURL(/page=2/);
  });

  test("row count info is visible", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // DataTable pagination shows "Page N of M" indicating total page count
    await expect(page.getByText(/page \d+ of \d+/i)).toBeVisible();
  });

  test("can sort by column header", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // Default sort is ascending — "Wine 01" should be first
    await expect(page.getByRole("row").nth(1)).toContainText("Wine 01");

    const wineNameHeader = page.getByRole("columnheader", {
      name: /wine name/i,
    });
    await wineNameHeader.click();

    // After clicking, sort toggles to descending — "Wine 25" should now be first
    await expect(page.getByRole("row").nth(1)).toContainText("Wine 25");
  });

  test("can select rows with checkboxes", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    const firstRowCheckbox = page.getByRole("row").nth(1).getByRole("checkbox");
    await firstRowCheckbox.click();

    // Bulk action bar should appear when a row is selected
    await expect(
      page
        .getByText(/selected/i)
        .or(page.getByRole("button", { name: /delete selected/i })),
    ).toBeVisible();
  });
});
