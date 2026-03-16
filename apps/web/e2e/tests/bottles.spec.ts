import { test, expect, setState, resetState } from "../fixtures/auth";

const BOTTLE_SEED = {
  winemakers: [{ id: 1, name: "Château Margaux" }],
  countries: [{ id: 1, name: "France" }],
  regions: [{ id: 1, name: "Bordeaux", countryId: 1 }],
  wines: [
    {
      id: 1,
      name: "Château Margaux 2015",
      type: "red",
      wineMakerId: 1,
      regionId: 1,
    },
  ],
  vintages: [
    { id: 1, wineId: 1, year: 2015, drinkFrom: 2022, drinkUntil: 2035 },
  ],
  locations: [{ id: 1, name: "Home Cellar" }],
  storages: [
    { id: 1, name: "Rack A", parent: null, locationId: 1 },
    { id: 2, name: "Shelf 1", parent: 1, locationId: 1 },
  ],
  bottles: [
    {
      id: 1,
      vintageId: 1,
      purchaseDate: "2022-06-15",
      purchasePrice: 150.0,
      storageId: 2,
      status: "stored",
      size: "standard",
    },
    {
      id: 2,
      vintageId: 1,
      purchaseDate: "2023-03-01",
      purchasePrice: 155.0,
      storageId: 1,
      status: "stored",
      size: "magnum",
    },
  ],
  settings: [
    { key: "currency", value: "USD" },
    { key: "date", value: "yyyy-MM-dd" },
  ],
  grapes: [],
};

test.describe("Bottles page", () => {
  test.beforeEach(async () => {
    await setState(BOTTLE_SEED);
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("renders bottles table", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/bottles");

    await expect(page.getByRole("heading", { name: "Bottles" })).toBeVisible();
  });

  test("shows bottle data in table", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/bottles");

    // Bottles page shows the vintage/wine name
    await expect(page.getByText("Château Margaux").first()).toBeVisible();
  });

  test("Add Bottle button navigates to new bottle page", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/bottles");

    await page.getByRole("button", { name: /create new bottle/i }).click();
    await expect(page).toHaveURL("/bottles/new");
  });

  test("shows purchase price formatted with currency", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/bottles");

    await expect(page.getByText("$150.00")).toBeVisible();
  });

  test("shows bottle status", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/bottles");

    await expect(page.getByText("Stored").first()).toBeVisible();
  });

  test("shows bottle size on hover", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/bottles");

    // Bottle sizes are shown as icons with tooltips on hover
    // Use span tooltip triggers to avoid matching action button tooltips
    const bottleIcons = page
      .getByRole("row")
      .locator("span[data-slot='tooltip-trigger']");
    await bottleIcons.first().hover();
    await expect(page.getByRole("tooltip")).toContainText("Standard (750ml)");

    // Move away to dismiss the first tooltip
    await page.getByRole("heading", { name: "Bottles" }).hover();
    await expect(page.getByRole("tooltip")).toBeHidden();

    await bottleIcons.nth(1).hover();
    await expect(page.getByRole("tooltip")).toContainText("Magnum (1.5L)");
  });
});
