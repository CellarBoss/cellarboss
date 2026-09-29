import { test, expect, setState } from "../fixtures/auth";
import { fieldCombobox } from "../fixtures/form";

test.describe("Storages page", () => {
  test.beforeEach(async () => {
    await setState({
      locations: [
        { id: 1, name: "Garage" },
        { id: 2, name: "Kitchen" },
      ],
      storages: [
        { id: 1, name: "Rack A", locationId: 1, parent: null },
        { id: 2, name: "Rack B", locationId: 2, parent: null },
      ],
    });
  });

  test("renders storages table with all storages", async ({
    adminPage: page,
  }) => {
    await page.goto("/storages");

    await expect(page.getByText("Rack A", { exact: true })).toBeVisible();
    await expect(page.getByText("Rack B", { exact: true })).toBeVisible();
  });

  test("filters storages by location", async ({ adminPage: page }) => {
    await page.goto("/storages");

    await page.getByRole("button", { name: /^Filters/ }).click();
    await page.getByRole("button", { name: "Location" }).click();
    await page.getByRole("checkbox", { name: "Kitchen" }).click();
    await page.keyboard.press("Escape");

    await expect(page).toHaveURL(/locationId=2/);
    await expect(page.getByText("Rack B", { exact: true })).toBeVisible();
    await expect(page.getByText("Rack A", { exact: true })).toBeHidden();

    await page.getByRole("button", { name: "Remove Location filter" }).click();
    await expect(page.getByText("Rack A", { exact: true })).toBeVisible();
  });

  test("new storage form pre-selects location from URL parameter", async ({
    adminPage: page,
  }) => {
    await page.goto("/storages/new?locationId=2");

    await expect(fieldCombobox(page, "Location")).toHaveText(/Kitchen/);
  });

  test("new storage form pre-selects parent from URL parameter", async ({
    adminPage: page,
  }) => {
    await page.goto("/storages/new?parentId=1");

    await expect(fieldCombobox(page, "Parent Storage")).toHaveText(/Rack A/);
  });

  test("new storage form has no selection without URL parameters", async ({
    adminPage: page,
  }) => {
    await page.goto("/storages/new");

    await expect(fieldCombobox(page, "Location")).toHaveText(
      /Choose an option/,
    );
    await expect(fieldCombobox(page, "Parent Storage")).toHaveText(
      /Choose an option/,
    );
  });

  test("Add sub-storage from storage page pre-selects that parent", async ({
    adminPage: page,
  }) => {
    await page.goto("/storages/2");

    await page.getByRole("link", { name: "Add sub-storage" }).click();

    await expect(page).toHaveURL(/\/storages\/new\?parentId=2/);
    await expect(fieldCombobox(page, "Parent Storage")).toHaveText(/Rack B/);
  });

  test("Add storage from location page pre-selects that location", async ({
    adminPage: page,
  }) => {
    await page.goto("/locations/1");

    await page.getByRole("link", { name: "Add storage" }).click();

    await expect(page).toHaveURL(/\/storages\/new\?locationId=1/);
    await expect(fieldCombobox(page, "Location")).toHaveText(/Garage/);
  });
});

test.describe("Storage page sub-storage bottles", () => {
  test.beforeEach(async () => {
    await setState({
      winemakers: [{ id: 1, name: "Felton Road" }],
      countries: [{ id: 1, name: "New Zealand" }],
      regions: [{ id: 1, name: "Central Otago", countryId: 1 }],
      wines: [
        { id: 1, name: "Pinot Noir", type: "red", wineMakerId: 1, regionId: 1 },
        { id: 2, name: "Riesling", type: "white", wineMakerId: 1, regionId: 1 },
        {
          id: 3,
          name: "Chardonnay",
          type: "white",
          wineMakerId: 1,
          regionId: 1,
        },
      ],
      vintages: [
        { id: 1, wineId: 1, year: 2021, drinkFrom: null, drinkUntil: null },
        { id: 2, wineId: 2, year: 2022, drinkFrom: null, drinkUntil: null },
        { id: 3, wineId: 3, year: 2020, drinkFrom: null, drinkUntil: null },
      ],
      locations: [{ id: 1, name: "Garage" }],
      storages: [
        { id: 1, name: "Fridge", locationId: 1, parent: null },
        { id: 2, name: "Top Shelf", locationId: 1, parent: 1 },
        { id: 3, name: "Left Box", locationId: 1, parent: 2 },
      ],
      bottles: [
        {
          id: 1,
          vintageId: 1,
          storageId: 1,
          purchaseDate: "2024-01-01",
          purchasePrice: 40,
          status: "stored",
          size: "standard",
        },
        {
          id: 2,
          vintageId: 2,
          storageId: 2,
          purchaseDate: "2024-01-01",
          purchasePrice: 40,
          status: "stored",
          size: "standard",
        },
        {
          id: 3,
          vintageId: 3,
          storageId: 3,
          purchaseDate: "2024-01-01",
          purchasePrice: 40,
          status: "stored",
          size: "standard",
        },
      ],
      preferences: [],
      settings: [],
      grapes: [],
    });
  });

  test("toggle includes bottles from sub-storages at every depth", async ({
    adminPage: page,
  }) => {
    await page.goto("/storages/1");

    const toggle = page.getByRole("switch", { name: "Include sub-storages" });
    await expect(toggle).not.toBeChecked();
    await expect(page.getByText("Pinot Noir 2021")).toBeVisible();
    await expect(page.getByText("Riesling 2022")).toHaveCount(0);
    await expect(page.getByText("Chardonnay 2020")).toHaveCount(0);

    await toggle.click();

    await expect(toggle).toBeChecked();
    await expect(page.getByText("Pinot Noir 2021")).toBeVisible();
    await expect(page.getByText("Riesling 2022")).toBeVisible();
    await expect(page.getByText("Chardonnay 2020")).toBeVisible();
    await expect(page.getByText("Top Shelf > Left Box")).toBeVisible();
  });

  test("toggle choice is remembered", async ({ adminPage: page }) => {
    await page.goto("/storages/1");

    await page.getByRole("switch", { name: "Include sub-storages" }).click();

    // The preference saves in the background, so retry the reload until it lands
    await expect(async () => {
      await page.goto("/storages/2");
      await expect(
        page.getByRole("switch", { name: "Include sub-storages" }),
      ).toBeChecked({ timeout: 1000 });
    }).toPass();
    await expect(page.getByText("Chardonnay 2020")).toBeVisible();
  });

  test("toggle is hidden when a storage has no sub-storages", async ({
    adminPage: page,
  }) => {
    await page.goto("/storages/3");

    await expect(page.getByText("Chardonnay 2020")).toBeVisible();
    await expect(
      page.getByRole("switch", { name: "Include sub-storages" }),
    ).toHaveCount(0);
  });
});
