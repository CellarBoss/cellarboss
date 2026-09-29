import type { Vintage, Wine, Region } from "@cellarboss/types";
import { test, expect, setState, resetState, getState } from "../fixtures/auth";
import { fieldCombobox } from "../fixtures/form";

// The mock server answers previews for URLs containing "margaux",
// "bordeaux-superieur" or "partial-rose", and fails every other URL.
const MARGAUX = "https://shop.example.com/margaux-2015";

type State = { wines: Wine[]; vintages: Vintage[]; regions: Region[] };

test.describe("Import wine", () => {
  test.beforeEach(async () => {
    await setState({
      winemakers: [{ id: 1, name: "Domaine Leflaive" }],
      countries: [{ id: 1, name: "France" }],
      regions: [{ id: 1, name: "Bordeaux", countryId: 1 }],
      grapes: [
        { id: 1, name: "Merlot" },
        { id: 2, name: "Cabernet Sauvignon" },
      ],
      wines: [],
      vintages: [],
      wineGrapes: [],
    });
  });

  test.afterEach(async () => {
    await resetState();
  });

  async function readPage(
    page: import("@playwright/test").Page,
    url: string,
  ): Promise<void> {
    await page.goto("/wines/import");
    await page.getByLabel("Product page link").fill(url);
    await page.getByRole("button", { name: "Get details" }).click();
  }

  test("opens from the Wines list", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");
    await page.getByRole("button", { name: "Import from link" }).click();
    await expect(page).toHaveURL(/\/wines\/import$/);
    await expect(
      page.getByRole("heading", { name: "Import Wine" }),
    ).toBeVisible();
    await expect(
      page.getByText("Paste a link to a wine’s page on a shop’s website."),
    ).toBeVisible();
  });

  test("imports a new wine and vintage", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await readPage(page, MARGAUX);

    await expect(page.getByLabel("Name")).toHaveValue("Margaux");
    await expect(fieldCombobox(page, "Winemaker")).toHaveText(
      /Château Example \(new\)/,
    );
    await expect(fieldCombobox(page, "Country")).toHaveText("France");
    // "Margaux" isn't in the cellar, so the region will be created in France
    await expect(fieldCombobox(page, "Region")).toHaveText(/Margaux \(new\)/);
    await expect(page.getByLabel("Vintage Year")).toHaveValue("2015");
    await expect(page.getByLabel("Drink Until")).toHaveValue("2040");

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page).toHaveURL(/\/vintages\/\d+$/);

    const state = await getState<State>();
    const wine = state.wines.find((w) => w.name === "Margaux");
    expect(wine).toBeDefined();
    expect(state.regions.map((r) => r.name)).toContain("Margaux");
    expect(state.vintages).toEqual([
      expect.objectContaining({ wineId: wine!.id, year: 2015 }),
    ]);
  });

  test("uses a close match, or creates the new name instead", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await readPage(page, "https://shop.example.com/bordeaux-superieur");

    await expect(fieldCombobox(page, "Region")).toHaveText("Bordeaux");
    await expect(
      page.getByText("close match for “Bordeaux Supérieur”"),
    ).toBeVisible();

    await page
      .getByRole("button", { name: "Create “Bordeaux Supérieur” instead" })
      .click();
    await expect(fieldCombobox(page, "Region")).toHaveText(
      /Bordeaux Supérieur \(new\)/,
    );

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page).toHaveURL(/\/vintages\/\d+$/);
    const state = await getState<State>();
    expect(state.regions.map((r) => r.name)).toContain("Bordeaux Supérieur");
  });

  test("creates a new grape from the selector", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await readPage(page, MARGAUX);

    const grapes = page
      .getByRole("group")
      .filter({ hasText: "Grapes" })
      .getByRole("button");
    await grapes.click();
    await page.getByPlaceholder("Search...").fill("Petit Verdot");
    await page.getByRole("option", { name: "Create “Petit Verdot”" }).click();
    await page.keyboard.press("Escape");
    await expect(grapes).toContainText("Petit Verdot (new)");
  });

  test("adds a vintage to a wine that already exists", async ({
    adminContext,
  }) => {
    await setState({
      winemakers: [{ id: 1, name: "Château Example" }],
      wines: [
        { id: 5, name: "Margaux", type: "red", wineMakerId: 1, regionId: 1 },
      ],
    });
    const page = await adminContext.newPage();
    await readPage(page, MARGAUX);

    await expect(page.getByTestId("import-existing-wine")).toContainText(
      "You already have Margaux. This will add the 2015 vintage to it.",
    );
    await expect(page.getByLabel("Name")).toHaveCount(0);

    await page.getByRole("button", { name: "Save" }).click();
    await expect(page).toHaveURL(/\/vintages\/\d+$/);
    const state = await getState<State>();
    expect(state.wines).toHaveLength(1);
    expect(state.vintages).toEqual([
      expect.objectContaining({ wineId: 5, year: 2015 }),
    ]);
  });

  test("Not this wine shows the full form", async ({ adminContext }) => {
    await setState({
      winemakers: [{ id: 1, name: "Château Example" }],
      wines: [
        { id: 5, name: "Margaux", type: "red", wineMakerId: 1, regionId: 1 },
      ],
    });
    const page = await adminContext.newPage();
    await readPage(page, MARGAUX);

    await page.getByRole("button", { name: "Not this wine" }).click();
    await expect(page.getByLabel("Name")).toHaveValue("Margaux");
  });

  test("offers the vintage when it already exists", async ({
    adminContext,
  }) => {
    await setState({
      winemakers: [{ id: 1, name: "Château Example" }],
      wines: [
        { id: 5, name: "Margaux", type: "red", wineMakerId: 1, regionId: 1 },
      ],
      vintages: [
        { id: 9, wineId: 5, year: 2015, drinkFrom: null, drinkUntil: null },
      ],
    });
    const page = await adminContext.newPage();
    await readPage(page, MARGAUX);

    await expect(page.getByRole("status")).toContainText(
      "You already have the 2015 vintage of Margaux.",
    );
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);
    await page.getByRole("link", { name: "Open vintage" }).click();
    await expect(page).toHaveURL(/\/vintages\/9$/);
  });

  test("shows one message when the page can't be read", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await readPage(page, "https://shop.example.com/unknown-wine");

    await expect(page.getByRole("status")).toHaveText(
      "Couldn’t get details from this link. You can fill in the form yourself.",
    );
    await expect(page.getByLabel("Name")).toHaveValue("");
  });
});
