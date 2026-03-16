import { test, expect, setState, resetState } from "../fixtures/auth";

test.describe("DataTable row expansion URL state", () => {
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
      wines: [
        { id: 1, name: "Wine Alpha", type: "red", wineMakerId: 1, regionId: 1 },
        {
          id: 2,
          name: "Wine Beta",
          type: "white",
          wineMakerId: 2,
          regionId: 2,
        },
        { id: 3, name: "Wine Gamma", type: "red", wineMakerId: 1, regionId: 1 },
      ],
      vintages: [],
    });
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("expanding a row updates the URL", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // Expand the first row
    const expandButton = page
      .getByRole("button", { name: "Expand row" })
      .first();
    await expandButton.click();

    // URL should contain the expanded row's ID
    await expect(page).toHaveURL(/expanded=1/);
  });

  test("collapsing all rows clears the URL parameter", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // Expand then collapse
    const expandButton = page
      .getByRole("button", { name: "Expand row" })
      .first();
    await expandButton.click();
    await expect(page).toHaveURL(/expanded=/);

    const collapseButton = page
      .getByRole("button", { name: "Collapse row" })
      .first();
    await collapseButton.click();

    // expanded param should be cleared or set to empty
    await expect(page).not.toHaveURL(/expanded=1/);
  });

  test("multiple rows can be expanded via clicks", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // Expand the first two rows
    const expandButtons = page.getByRole("button", { name: "Expand row" });
    await expandButtons.nth(0).click();
    // Wait for the first row's button to change to "Collapse row" before clicking the next
    await expect(
      page.getByRole("button", { name: "Collapse row" }),
    ).toHaveCount(1);
    await expandButtons.nth(0).click(); // Now nth(0) resolves to the second row's expand button

    // URL should contain both IDs
    await expect(page).toHaveURL(/expanded=.*1/);
    await expect(page).toHaveURL(/expanded=.*2/);
  });

  test("expanded state persists across page refresh", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // Expand the first row
    const expandButton = page
      .getByRole("button", { name: "Expand row" })
      .first();
    await expandButton.click();

    // Wait for URL to update
    await expect(page).toHaveURL(/expanded=1/);

    // Refresh the page
    await page.reload();

    // The row should still be expanded — collapse button should be visible
    await expect(
      page.getByRole("button", { name: "Collapse row" }),
    ).toBeVisible();
  });

  test("navigating to URL with expanded param restores expansion", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines?expanded=2");

    // The second wine's row should be expanded
    await expect(
      page.getByRole("button", { name: "Collapse row" }),
    ).toBeVisible();

    // Only one row should be expanded
    await expect(
      page.getByRole("button", { name: "Collapse row" }),
    ).toHaveCount(1);

    // The other rows should still have expand buttons
    await expect(page.getByRole("button", { name: "Expand row" })).toHaveCount(
      2,
    );
  });
});
