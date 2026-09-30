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

  test("shows embedded tasting note and bottle counts", async ({
    adminPage: page,
  }) => {
    const note = (id: number, vintageId: number) => ({
      id,
      vintageId,
      date: "2025-11-15T19:30:00.000Z",
      authorId: "admin-1",
      author: "Test Admin",
      score: 8,
      notes: "Note",
    });
    const bottle = (id: number, vintageId: number, status: string) => ({
      id,
      vintageId,
      status,
      purchaseDate: "2024-01-01",
      purchasePrice: 20,
      storageId: null,
      size: "standard",
    });
    await setState({
      wines: [
        {
          id: 1,
          name: "Margaux Reserve",
          type: "red",
          wineMakerId: 1,
          regionId: 1,
        },
      ],
      vintages: [
        { id: 1, wineId: 1, year: 2015, drinkFrom: null, drinkUntil: null },
        { id: 2, wineId: 1, year: 2016, drinkFrom: null, drinkUntil: null },
      ],
      tastingNotes: [note(1, 1), note(2, 1), note(3, 2)],
      bottles: [
        bottle(1, 1, "stored"),
        bottle(2, 1, "stored"),
        bottle(3, 1, "drunk"),
        bottle(4, 2, "ordered"),
      ],
    });
    await page.goto("/wines?expanded=1");

    const notesButtons = page.getByRole("button", {
      name: "View Tasting Notes",
    });
    // Wine row total, then one button per vintage (2016 first)
    await expect(notesButtons.nth(0)).toHaveText("3");
    await expect(notesButtons.nth(1)).toHaveText("1");
    await expect(notesButtons.nth(2)).toHaveText("2");

    await expect(page.getByRole("link", { name: "2 Stored" })).toBeVisible();
    await expect(page.getByRole("link", { name: "1 Ordered" })).toBeVisible();
    await expect(page.getByText("1 Drunk")).not.toBeVisible();
  });
});
