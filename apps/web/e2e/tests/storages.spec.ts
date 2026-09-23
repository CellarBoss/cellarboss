import { test, expect, setState, resetState } from "../fixtures/auth";
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

  test.afterEach(async () => {
    await resetState();
  });

  test("renders storages table with all storages", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages");

    await expect(page.getByText("Rack A", { exact: true })).toBeVisible();
    await expect(page.getByText("Rack B", { exact: true })).toBeVisible();
  });

  test("new storage form pre-selects location from URL parameter", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages/new?locationId=2");

    await expect(fieldCombobox(page, "Location")).toHaveText(/Kitchen/);
  });

  test("new storage form pre-selects parent from URL parameter", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages/new?parentId=1");

    await expect(fieldCombobox(page, "Parent Storage")).toHaveText(/Rack A/);
  });

  test("new storage form has no selection without URL parameters", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages/new");

    await expect(fieldCombobox(page, "Location")).toHaveText(
      /Choose an option/,
    );
    await expect(fieldCombobox(page, "Parent Storage")).toHaveText(
      /Choose an option/,
    );
  });

  test("Add sub-storage from storage page pre-selects that parent", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/storages/2");

    await page.getByRole("link", { name: "Add sub-storage" }).click();

    await expect(page).toHaveURL(/\/storages\/new\?parentId=2/);
    await expect(fieldCombobox(page, "Parent Storage")).toHaveText(/Rack B/);
  });

  test("Add storage from location page pre-selects that location", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/locations/1");

    await page.getByRole("link", { name: "Add storage" }).click();

    await expect(page).toHaveURL(/\/storages\/new\?locationId=1/);
    await expect(fieldCombobox(page, "Location")).toHaveText(/Garage/);
  });
});
