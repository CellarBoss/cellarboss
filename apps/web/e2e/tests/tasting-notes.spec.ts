import { test, expect, setState } from "../fixtures/auth";

test.describe("Tasting Notes page", () => {
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
      ],
      vintages: [
        { id: 1, wineId: 1, year: 2015, drinkFrom: 2022, drinkUntil: 2035 },
        { id: 2, wineId: 2, year: 2020, drinkFrom: null, drinkUntil: 2030 },
      ],
      tastingNotes: [
        {
          id: 1,
          vintageId: 1,
          date: "2025-11-15T19:30:00.000Z",
          authorId: "admin-1",
          author: "Test Admin",
          score: 9,
          notes: "Exceptional depth and complexity.",
        },
        {
          id: 2,
          vintageId: 2,
          date: "2025-10-20T12:00:00.000Z",
          authorId: "admin-1",
          author: "Test Admin",
          score: 7,
          notes: "Elegant and well-balanced.",
        },
      ],
      settings: [
        { key: "currency", value: "USD" },
        { key: "date", value: "yyyy-MM-dd" },
        { key: "datetime", value: "yyyy-MM-dd HH:mm" },
      ],
    });
  });

  test("renders tasting notes list", async ({ adminPage: page }) => {
    await page.goto("/tasting-notes");

    await expect(
      page.getByRole("heading", { name: "Tasting Notes" }),
    ).toBeVisible();
    await expect(
      page.getByText("Exceptional depth and complexity."),
    ).toBeVisible();
    await expect(page.getByText("Elegant and well-balanced.")).toBeVisible();
  });

  test("shows empty state when no notes", async ({ adminPage: page }) => {
    await setState({ tastingNotes: [] });
    await page.goto("/tasting-notes");

    await expect(page.getByText("No tasting notes yet.")).toBeVisible();
  });

  test("Add Tasting Note button navigates to new page", async ({
    adminPage: page,
  }) => {
    await page.goto("/tasting-notes");

    await page
      .getByRole("button", { name: /create new tasting note/i })
      .click();
    await expect(page).toHaveURL("/tasting-notes/new");
  });

  test("displays score badges", async ({ adminPage: page }) => {
    await page.goto("/tasting-notes");

    // Both scores should be visible
    await expect(page.getByText("9").first()).toBeVisible();
    await expect(page.getByText("7").first()).toBeVisible();
  });

  test("displays author names", async ({ adminPage: page }) => {
    await page.goto("/tasting-notes");

    await expect(page.getByText("Test Admin").first()).toBeVisible();
  });

  test("edit button navigates to edit page", async ({ adminPage: page }) => {
    await page.goto("/tasting-notes");

    const editButtons = page.getByRole("button", { name: /edit/i });
    await editButtons.first().click();
    await expect(page).toHaveURL(/\/tasting-notes\/\d+\/edit/);
  });

  test("tasting notes button on the wines list opens the wine's notes", async ({
    adminPage: page,
  }) => {
    await page.goto("/wines");

    await page
      .getByRole("button", { name: "View Tasting Notes" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/wines\/\d+#tasting-notes$/);
  });

  test("new note from a wine page preselects that wine", async ({
    adminPage: page,
  }) => {
    await page.goto("/tasting-notes/new?wineId=2");

    await expect(
      page.getByRole("combobox").filter({ hasText: "Blanc de Blanc" }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("combobox")
        .filter({ hasText: "Choose a vintage year..." }),
    ).toBeVisible();
  });

  test("new note from a vintage page preselects that wine and vintage", async ({
    adminPage: page,
  }) => {
    await page.goto("/tasting-notes/new?vintageId=1");

    await expect(
      page.getByRole("combobox").filter({ hasText: "Margaux Reserve" }),
    ).toBeVisible();
    await expect(
      page.getByRole("combobox").filter({ hasText: "2015" }),
    ).toBeVisible();
  });

  test("new note ignores an invalid wineId", async ({ adminPage: page }) => {
    await page.goto("/tasting-notes/new?wineId=abc");

    await expect(
      page.getByRole("combobox").filter({ hasText: "Choose a wine..." }),
    ).toBeVisible();
  });
});
