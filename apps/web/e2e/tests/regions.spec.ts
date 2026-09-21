import { test, expect, setState, resetState } from "../fixtures/auth";
import { fieldCombobox } from "../fixtures/form";

test.describe("Regions page", () => {
  test.beforeEach(async () => {
    await setState({
      countries: [
        { id: 1, name: "France" },
        { id: 2, name: "Italy" },
      ],
      regions: [
        { id: 1, name: "Bordeaux", countryId: 1 },
        { id: 2, name: "Tuscany", countryId: 2 },
      ],
    });
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("renders regions table with all regions", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/regions");

    await expect(page.getByText("Bordeaux")).toBeVisible();
    await expect(page.getByText("Tuscany")).toBeVisible();
  });

  test("new region form pre-selects country from URL parameter", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/regions/new?countryId=2");

    await expect(fieldCombobox(page, "Country")).toHaveText(/Italy/);
  });

  test("new region form has no selection without URL parameters", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/regions/new");

    await expect(fieldCombobox(page, "Country")).toHaveText(/Choose an option/);
  });

  test("Add region from country page pre-selects that country", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/countries/1");

    await page.getByRole("link", { name: "Add region" }).click();

    await expect(page).toHaveURL(/\/regions\/new\?countryId=1/);
    await expect(fieldCombobox(page, "Country")).toHaveText(/France/);
  });
});
