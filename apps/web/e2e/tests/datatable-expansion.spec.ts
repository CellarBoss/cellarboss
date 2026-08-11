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

test.describe("DataTable row expansion with hierarchical (getSubRows) data", () => {
  // Regression coverage needs enough rows to exceed one page (default page
  // size is 20): with only a couple of storages, every render's freshly-built
  // tree `data` array happens not to trip the bug this guards against (v9's
  // `getCoreRowModel` auto-resets `expanded` back to `{}` whenever the `data`
  // reference changes, which used to fire on every click since storages/page.tsx
  // rebuilds its tree data on every render). 15 racks x 2 rows = 30 rows makes
  // the failure reproduce reliably.
  const RACK_COUNT = 15;

  test.beforeEach(async () => {
    const storages: {
      id: number;
      name: string;
      parent: number | null;
      locationId: number;
    }[] = [];
    let id = 1;
    for (let i = 1; i <= RACK_COUNT; i++) {
      const rackId = id++;
      storages.push({
        id: rackId,
        name: `Rack ${i}`,
        parent: null,
        locationId: 1,
      });
      storages.push({
        id: id++,
        name: `Shelf ${i}`,
        parent: rackId,
        locationId: 1,
      });
    }
    await setState({ locations: [{ id: 1, name: "Main Cellar" }], storages });
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("all rows are expanded by default", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages");

    await expect(page.getByText("Shelf 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Shelf 2", { exact: true })).toBeVisible();
  });

  test("collapsing one row leaves other rows expanded (regression: v9 auto-reset was clobbering expanded state on every re-render)", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages");

    await expect(page.getByText("Shelf 1", { exact: true })).toBeVisible();
    await expect(page.getByText("Shelf 2", { exact: true })).toBeVisible();

    const rack1Row = page.locator("tr").filter({ hasText: /Rack 1(?!\d)/ });
    await rack1Row.getByRole("button", { name: "Collapse row" }).click();
    // The regression fires from a microtask-scheduled table-internal reset
    // that lands just after the click handler returns, so the assertions
    // below can pass immediately on the very state the bug is about to
    // overwrite unless we let that microtask (and the resulting re-render)
    // settle first.
    await page.waitForTimeout(500);

    // Only Rack 1's child should be hidden; Rack 2's child stays visible
    await expect(page.getByText("Shelf 1", { exact: true })).not.toBeVisible();
    await expect(page.getByText("Shelf 2", { exact: true })).toBeVisible();
  });

  test("a collapsed row can be re-expanded", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages");

    const rack1Row = page.locator("tr").filter({ hasText: /Rack 1(?!\d)/ });
    await rack1Row.getByRole("button", { name: "Collapse row" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("Shelf 1", { exact: true })).not.toBeVisible();

    await rack1Row.getByRole("button", { name: "Expand row" }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText("Shelf 1", { exact: true })).toBeVisible();
  });
});
