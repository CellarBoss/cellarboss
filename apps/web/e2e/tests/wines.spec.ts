import { test, expect, setState } from "../fixtures/auth";
import { fieldCombobox } from "../fixtures/form";

test.describe("Wines page", () => {
  test.beforeEach(async () => {
    await setState({
      winemakers: [
        { id: 1, name: "Château Margaux" },
        { id: 2, name: "Domaine Leflaive" },
      ],
      regions: [
        { id: 1, name: "Bordeaux", countryId: 1 },
        { id: 2, name: "Burgundy", countryId: 1 },
      ],
      countries: [{ id: 1, name: "France" }],
      wines: [
        {
          id: 1,
          name: "Margaux Reserve",
          type: "red",
          wineMakerId: 1,
          regionId: 1,
        },
        {
          id: 2,
          name: "Blanc de Blanc",
          type: "white",
          wineMakerId: 2,
          regionId: 2,
        },
        {
          id: 3,
          name: "Rosé d'Été",
          type: "rose",
          wineMakerId: 1,
          regionId: null,
        },
      ],
    });
  });

  test("renders wines table with all wines", async ({ adminPage: page }) => {
    await page.goto("/wines");

    await expect(page.getByText("Margaux Reserve")).toBeVisible();
    await expect(page.getByText("Blanc de Blanc")).toBeVisible();
    await expect(page.getByText("Rosé d'Été")).toBeVisible();
  });

  test("shows Wines heading", async ({ adminPage: page }) => {
    await page.goto("/wines");

    await expect(page.getByRole("heading", { name: "Wines" })).toBeVisible();
  });

  test("search filters wines and updates URL", async ({ adminPage: page }) => {
    await page.goto("/wines");
    await expect(page.getByText("Margaux Reserve")).toBeVisible();

    await page.getByPlaceholder("Search...").fill("blanc");

    await expect(page.getByText("Blanc de Blanc")).toBeVisible();
    await expect(page.getByText("Margaux Reserve")).not.toBeVisible();
    await expect(page).toHaveURL(/search=blanc/);
  });

  test("Add Wine button navigates to new wine page", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines");

    await page.getByRole("button", { name: /create new wine/i }).click();
    await expect(page).toHaveURL("/wines/new");
  });

  test("empty table shows no results message", async ({ adminPage: page }) => {
    await setState({ wines: [] });
    await page.goto("/wines");

    await expect(page.getByText("No results.")).toBeVisible();
  });

  test("clicking wine name navigates to detail page", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines");

    await page.getByRole("link", { name: "Margaux Reserve" }).click();
    await expect(page).toHaveURL("/wines/1");
  });

  test("winemaker name links to winemaker detail", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines");

    await expect(
      page.getByRole("link", { name: "Château Margaux" }).first(),
    ).toBeVisible();
  });

  test("new wine form pre-selects winemaker from URL parameter", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines/new?winemakerId=2");

    await expect(fieldCombobox(page, "Winemaker")).toHaveText(
      /Domaine Leflaive/,
    );
  });

  test("new wine form pre-selects region from URL parameter", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines/new?regionId=2");

    await expect(fieldCombobox(page, "Region")).toHaveText(/Burgundy/);
  });

  test("new wine form has no selection without URL parameters", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines/new");

    await expect(fieldCombobox(page, "Winemaker")).toHaveText(
      /Choose an option/,
    );
    await expect(fieldCombobox(page, "Region")).toHaveText(/Choose an option/);
  });

  test("Add wine from winemaker page pre-selects that winemaker", async ({
    adminPage: page,
  }) => {
    await page.goto("/winemakers/1");

    await page.getByRole("link", { name: "Add wine" }).click();

    await expect(page).toHaveURL(/\/wines\/new\?winemakerId=1/);
    await expect(fieldCombobox(page, "Winemaker")).toHaveText(
      /Château Margaux/,
    );
  });

  test("Add wine from region page pre-selects that region", async ({
    adminPage: page,
  }) => {
    await page.goto("/regions/2");

    await page.getByRole("link", { name: "Add wine" }).click();

    await expect(page).toHaveURL(/\/wines\/new\?regionId=2/);
    await expect(fieldCombobox(page, "Region")).toHaveText(/Burgundy/);
  });
});
