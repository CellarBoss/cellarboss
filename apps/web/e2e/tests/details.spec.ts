import { test, expect } from "../fixtures/auth";

// Detail pages against the mock server's default data: Château Margaux (red,
// Bordeaux, France, Cabernet Sauvignon) with a 2015 vintage that has one
// stored bottle on Rack A > Shelf 1 in the Home Cellar and one tasting note.

test.describe("Detail pages", () => {
  test("wine page links to its winemaker, region, country and grapes", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines/1");

    await expect(
      page.getByRole("heading", { name: "Château Margaux" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Château Margaux" }),
    ).toHaveAttribute("href", "/winemakers/1");
    await expect(page.getByRole("link", { name: "Bordeaux" })).toHaveAttribute(
      "href",
      "/regions/1",
    );
    await expect(page.getByRole("link", { name: "France" })).toHaveAttribute(
      "href",
      "/countries/1",
    );
    await expect(
      page.getByRole("link", { name: "Cabernet Sauvignon" }),
    ).toHaveAttribute("href", "/grapes/1");
    await expect(page.getByText("Red", { exact: true })).toBeVisible();
  });

  test("wine page lists vintages and their tasting notes", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines/1");

    // The vintage row reads as its drinking window and stored bottle count
    const vintage = page.getByRole("link", { name: "2022 until 2035 1" });
    await expect(vintage).toHaveAttribute("href", "/vintages/1");
    await expect(
      page.getByText(/Exceptional depth and complexity/),
    ).toBeVisible();

    await vintage.click();
    await expect(page).toHaveURL("/vintages/1");
  });

  test("vintage page shows where its bottles are stored", async ({
    adminPage: page,
  }) => {
    await page.goto("/vintages/1");

    await expect(
      page.getByRole("heading", { name: /Château Margaux\s*2015/ }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Bottles/ })).toContainText(
      "1",
    );
    await expect(
      page.getByRole("link", { name: /Home Cellar Rack A > Shelf 1 Stored/ }),
    ).toBeVisible();
  });

  test("winemaker page lists its wines", async ({ adminPage: page }) => {
    await page.goto("/winemakers/2");

    await expect(
      page.getByRole("heading", { name: "Domaine Leflaive" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Meursault Premier Cru/ }),
    ).toHaveAttribute("href", "/wines/2");
  });

  test("country page lists its regions", async ({ adminPage: page }) => {
    await page.goto("/countries/1");

    await expect(page.getByRole("link", { name: /Bordeaux/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Burgundy/ })).toBeVisible();
    await expect(page.getByText("No regions yet")).toBeHidden();
  });

  test("location page lists its storages", async ({ adminPage: page }) => {
    await page.goto("/locations/1");

    await expect(page.getByRole("link", { name: /Rack A/ })).toBeVisible();
  });

  test("a missing record shows an error instead of the page", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines/999");

    await expect(
      page.getByRole("heading", { name: "Wine Details" }),
    ).toBeHidden();
    // Queries retry before giving up, so the error takes a few seconds
    await expect(page.getByText("Ooops...")).toBeVisible({ timeout: 15000 });
  });
});
