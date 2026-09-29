import { test, expect, getState } from "../fixtures/auth";
import { chooseOption, fieldCombobox, saveForm } from "../fixtures/form";

// These tests run against the mock server's default data: two winemakers,
// France and Italy, Bordeaux and Burgundy, two wines with one vintage each,
// and a Home Cellar location holding Rack A > Shelf 1.

test.describe("Create forms", () => {
  test("creates a region in the chosen country", async ({
    adminPage: page,
  }) => {
    await page.goto("/regions/new");

    await page.getByLabel("Name").fill("Tuscany");
    await chooseOption(page, "Country", "Italy");
    await saveForm(page);

    await expect(page).toHaveURL("/regions");
    await expect(page.getByRole("link", { name: "Tuscany" })).toBeVisible();
    const { regions } = await getState();
    expect(regions).toContainEqual(
      expect.objectContaining({ name: "Tuscany", countryId: 2 }),
    );
  });

  test("creates a wine with its grapes", async ({ adminPage: page }) => {
    await page.goto("/wines/new");

    await page.getByLabel("Name").fill("Pavillon Rouge");
    await chooseOption(page, "Type", "Red");
    await chooseOption(page, "Winemaker", "Château Margaux");
    await chooseOption(page, "Region", "Bordeaux");
    // The multi-select opens from a plain button rather than a combobox
    await page
      .getByRole("group")
      .filter({ hasText: "Grapes" })
      .getByRole("button")
      .click();
    await page.getByRole("option", { name: "Cabernet Sauvignon" }).click();
    await page.keyboard.press("Escape");
    await saveForm(page);

    await expect(page).toHaveURL("/wines");
    await expect(
      page.getByRole("link", { name: "Pavillon Rouge" }),
    ).toBeVisible();

    const { wines, wineGrapes } = await getState();
    const wine = wines.find((w) => w.name === "Pavillon Rouge");
    expect(wine).toMatchObject({ type: "red", wineMakerId: 1, regionId: 1 });
    expect(wineGrapes).toContainEqual(
      expect.objectContaining({ wineId: wine!.id, grapeId: 1 }),
    );
  });

  test("adds a vintage from the wine page", async ({ adminPage: page }) => {
    await page.goto("/wines/1");
    await page.getByRole("link", { name: "Add vintage" }).click();

    await expect(page).toHaveURL("/vintages/new?wineId=1");
    await expect(fieldCombobox(page, "Wine")).toHaveText(/Château Margaux/);

    await page.getByLabel("Year").fill("2018");
    await page.getByLabel("Drink From").fill("2025");
    await page.getByLabel("Drink Until").fill("2040");
    await saveForm(page);

    await expect(page).toHaveURL("/wines/1");
    await expect(page.getByRole("link", { name: /2018/ })).toBeVisible();
    const { vintages } = await getState();
    expect(vintages).toContainEqual(
      expect.objectContaining({
        wineId: 1,
        year: 2018,
        drinkFrom: 2025,
        drinkUntil: 2040,
      }),
    );
  });

  test("adds a tasting note for a vintage", async ({ adminPage: page }) => {
    await page.goto("/tasting-notes/new?vintageId=2");

    await page.getByRole("button", { name: "Score 8 out of 10" }).click();
    await expect(page.getByText("8/10")).toBeVisible();
    await page.getByLabel("Notes").fill("Buttery with a long finish.");
    await saveForm(page);

    await expect(page).toHaveURL("/vintages/2");
    const { tastingNotes } = await getState();
    expect(tastingNotes).toContainEqual(
      expect.objectContaining({
        vintageId: 2,
        score: 8,
        notes: "Buttery with a long finish.",
      }),
    );
  });

  test("adds several bottles of a vintage at once", async ({
    adminPage: page,
  }) => {
    await page.goto("/bottles/new?vintageId=2");

    await page.getByLabel("Purchase Price").fill("42");
    await chooseOption(page, "Storage", "Rack A");
    await chooseOption(page, "Status", "Stored");
    await page.getByLabel("Quantity").fill("3");
    await saveForm(page);

    await expect(page).toHaveURL("/vintages/2");
    const { bottles } = await getState();
    const added = bottles.filter((b) => b.vintageId === 2);
    expect(added).toHaveLength(3);
    for (const bottle of added) {
      expect(bottle).toMatchObject({
        purchasePrice: 42,
        storageId: 1,
        status: "stored",
        size: "standard",
      });
    }
  });
});

test.describe("Edit forms", () => {
  test("edits a vintage's drinking window", async ({ adminPage: page }) => {
    await page.goto("/vintages/1/edit");

    await expect(page.getByLabel("Year")).toHaveValue("2015");
    await page.getByLabel("Drink Until").fill("2040");
    await saveForm(page);

    const { vintages } = await getState();
    expect(vintages.find((v) => v.id === 1)).toMatchObject({
      year: 2015,
      drinkFrom: 2022,
      drinkUntil: 2040,
    });
  });

  test("edits a tasting note's score and notes", async ({
    adminPage: page,
  }) => {
    await page.goto("/tasting-notes/1/edit");

    await expect(page.getByText("9/10")).toBeVisible();
    await page.getByRole("button", { name: "Score 6 out of 10" }).click();
    await page.getByLabel("Notes").fill("Closed up since last time.");
    await saveForm(page);

    const { tastingNotes } = await getState();
    expect(tastingNotes.find((n) => n.id === 1)).toMatchObject({
      score: 6,
      notes: "Closed up since last time.",
    });
  });

  test("reset restores the saved values", async ({ adminPage: page }) => {
    await page.goto("/winemakers/1/edit");

    const name = page.getByLabel("Name");
    await name.fill("Something else");
    await page.getByRole("button", { name: "Reset" }).click();

    await expect(name).toHaveValue("Château Margaux");
  });
});
