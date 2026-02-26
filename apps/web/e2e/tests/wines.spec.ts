import { test, expect, setState, resetState } from "../fixtures/auth";

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

  test.afterEach(async () => {
    await resetState();
  });

  test("renders wines table with all wines", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await expect(page.getByText("Margaux Reserve")).toBeVisible();
    await expect(page.getByText("Blanc de Blanc")).toBeVisible();
    await expect(page.getByText("Rosé d'Été")).toBeVisible();
  });

  test("shows Wines heading", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await expect(
      page.getByRole("heading", { name: "Wines" }),
    ).toBeVisible();
  });

  test("search filters wines and updates URL", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await expect(page.getByText("Margaux Reserve")).toBeVisible();

    const searchInput = page
      .getByRole("textbox", { name: /search/i })
      .or(page.locator("input[placeholder*='Search']"))
      .or(page.locator("input[placeholder*='search']"))
      .first();
    await searchInput.fill("blanc");

    await expect(page.getByText("Blanc de Blanc")).toBeVisible();
    await expect(page.getByText("Margaux Reserve")).not.toBeVisible();
  });

  test("search term appears in URL", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    const searchInput = page
      .locator("input[placeholder*='Search'], input[placeholder*='search']")
      .first();
    await searchInput.fill("margaux");

    await expect(page).toHaveURL(/search=margaux/);
  });

  test("Add Wine button navigates to new wine page", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await page.getByRole("button", { name: /create new wine/i }).click();
    await expect(page).toHaveURL("/wines/new");
  });

  test("empty table shows no results message", async ({ adminContext }) => {
    await setState({ wines: [] });
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await expect(page.getByText("No results.")).toBeVisible();
  });

  test("clicking wine name navigates to detail page", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await page.getByRole("link", { name: "Margaux Reserve" }).click();
    await expect(page).toHaveURL("/wines/1");
  });

  test("winemaker name links to winemaker detail", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await expect(
      page.getByRole("link", { name: "Château Margaux" }).first(),
    ).toBeVisible();
  });
});
