import { test, expect, setState, resetState } from "../fixtures/auth";

const today = new Date().toISOString().split("T")[0]; // e.g. "2026-03-18"
const currentYear = new Date().getFullYear();

function buildDashboardState() {
  return {
    winemakers: [
      { id: 1, name: "Château Margaux" },
      { id: 2, name: "Domaine Leflaive" },
      { id: 3, name: "Penfolds" },
    ],
    countries: [
      { id: 1, name: "France" },
      { id: 2, name: "Australia" },
    ],
    regions: [
      { id: 1, name: "Bordeaux", countryId: 1 },
      { id: 2, name: "Burgundy", countryId: 1 },
      { id: 3, name: "Barossa Valley", countryId: 2 },
    ],
    wines: [
      { id: 1, name: "Grand Vin", type: "red", wineMakerId: 1, regionId: 1 },
      {
        id: 2,
        name: "Meursault Premier Cru",
        type: "white",
        wineMakerId: 2,
        regionId: 2,
      },
      { id: 3, name: "Grange", type: "red", wineMakerId: 3, regionId: 3 },
    ],
    vintages: [
      {
        id: 1,
        wineId: 1,
        year: 2015,
        drinkFrom: 2020,
        drinkUntil: currentYear + 1,
      },
      {
        id: 2,
        wineId: 2,
        year: 2020,
        drinkFrom: currentYear - 1,
        drinkUntil: currentYear + 5,
      },
      {
        id: 3,
        wineId: 3,
        year: 2018,
        drinkFrom: 2025,
        drinkUntil: currentYear + 10,
      },
    ],
    bottles: [
      {
        id: 1,
        vintageId: 1,
        purchaseDate: today,
        purchasePrice: 250.0,
        storageId: 1,
        status: "stored",
        size: "standard",
      },
      {
        id: 2,
        vintageId: 1,
        purchaseDate: today,
        purchasePrice: 250.0,
        storageId: 1,
        status: "stored",
        size: "standard",
      },
      {
        id: 3,
        vintageId: 2,
        purchaseDate: today,
        purchasePrice: 85.0,
        storageId: 1,
        status: "stored",
        size: "standard",
      },
      {
        id: 4,
        vintageId: 3,
        purchaseDate: "2024-01-15",
        purchasePrice: 500.0,
        storageId: 1,
        status: "stored",
        size: "standard",
      },
      {
        id: 5,
        vintageId: 1,
        purchaseDate: "2023-06-01",
        purchasePrice: 200.0,
        storageId: 1,
        status: "consumed",
        size: "standard",
      },
    ],
    tastingNotes: [
      {
        id: 1,
        vintageId: 1,
        date: new Date().toISOString(),
        authorId: "admin-user-1",
        author: "Test Admin",
        score: 9,
        notes: "Exceptional wine",
      },
      {
        id: 2,
        vintageId: 2,
        date: new Date().toISOString(),
        authorId: "admin-user-1",
        author: "Test Admin",
        score: 8,
        notes: "Elegant and refined",
      },
      {
        id: 3,
        vintageId: 1,
        date: new Date().toISOString(),
        authorId: "admin-user-1",
        author: "Test Admin",
        score: 10,
        notes: "Perfect",
      },
    ],
    storages: [{ id: 1, name: "Rack A", parent: null, locationId: 1 }],
    locations: [{ id: 1, name: "Home Cellar" }],
    settings: [
      { key: "currency", value: "USD" },
      { key: "date", value: "yyyy-MM-dd" },
      { key: "datetime", value: "yyyy-MM-dd HH:mm" },
    ],
    grapes: [],
    wineGrapes: [],
    users: [
      {
        id: "admin-user-1",
        name: "Test Admin",
        email: "admin@cellarboss.test",
        role: "admin",
        createdAt: "2024-01-01T00:00:00.000Z",
        banned: null,
        banReason: null,
      },
    ],
  };
}

test.describe("Dashboard page", () => {
  test.beforeEach(async () => {
    await setState(buildDashboardState());
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("renders dashboard heading", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "CellarBoss Dashboard" }),
    ).toBeVisible();
    await expect(page.getByText("Your cellar at a glance")).toBeVisible();
  });

  test("displays cellar overview stat cards", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    // Total Bottles: 4 stored (ids 1-4, id 5 is consumed)
    await expect(page.getByText("Total Bottles")).toBeVisible();
    await expect(page.getByText("Currently in cellar")).toBeVisible();

    // Unique Wines: 3 distinct wines (Grand Vin, Meursault, Grange)
    await expect(page.getByText("Unique Wines")).toBeVisible();

    // Cellar Value
    await expect(page.getByText("Cellar Value", { exact: true })).toBeVisible();

    // Ready to Drink
    await expect(
      page.getByText("Ready to Drink", { exact: true }),
    ).toBeVisible();
  });

  test("shows wine type breakdown chart", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(page.getByText("Wine Types")).toBeVisible();
    await expect(page.getByText("Bottles by wine type")).toBeVisible();
  });

  test("shows drinking window timeline", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(page.getByText("Drinking Window Timeline")).toBeVisible();
  });

  test("shows cellar value over time chart", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(page.getByText("Cellar Value Over Time")).toBeVisible();
  });

  test("displays top rated wines with scores", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(page.getByText("Top Rated Wines")).toBeVisible();
    await expect(
      page.getByText("Highest rated by tasting notes"),
    ).toBeVisible();

    // Grand Vin has average score (9+10)/2 = 9.5, should be #1
    await expect(page.getByText("9.5")).toBeVisible();

    // Meursault has score 8.0
    await expect(page.getByText("8.0")).toBeVisible();

    // Wine names should be links
    await expect(
      page.getByRole("link", { name: "Grand Vin" }).first(),
    ).toBeVisible();
  });

  test("displays drinking suggestions for wines near end of window", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(page.getByText("Drink Soon")).toBeVisible();
    await expect(
      page.getByText("Bottles nearing end of drinking window"),
    ).toBeVisible();

    // Grand Vin 2015 has drinkUntil = currentYear + 1 (within 2 year cutoff)
    // Should show "By <year>" badge
    await expect(page.getByText(`By ${currentYear + 1}`)).toBeVisible();
  });

  test("displays recent activity with purchases and tastings", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(page.getByText("Recent Activity")).toBeVisible();
    await expect(
      page.getByText("Purchases and tastings from the last 30 days"),
    ).toBeVisible();

    // Recent purchases (bottles 1-3 purchased today)
    await expect(page.getByText("Purchased").first()).toBeVisible();

    // Recent tastings (all 3 notes are from today)
    await expect(page.getByText(/Scored 9\/10 by Test Admin/)).toBeVisible();
  });

  test("displays country distribution chart", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(page.getByText("Top Countries")).toBeVisible();
    await expect(
      page.getByText("Stored bottles by country of origin"),
    ).toBeVisible();
  });

  test("top rated wine name links to wine detail page", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    // Find the Grand Vin link within the top rated section and click it
    const topRated = page.locator(
      ":has(> :text('Top Rated Wines')) >> a:has-text('Grand Vin')",
    );
    // Use a more specific locator for the wine link
    const wineLink = page.getByRole("link", { name: "Grand Vin" }).first();
    await wineLink.click();
    await expect(page).toHaveURL("/wines/1");
  });

  test("drinking suggestions wine name links to wine page", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    // Grand Vin appears in drink soon since drinkUntil is within 2 years
    await expect(page.getByText("Drink Soon")).toBeVisible();

    // Click the vintage year link next to Grand Vin in drink soon
    // Use the "By <year>" badge to scope to the drink soon section
    const drinkSoonItem = page
      .locator("div")
      .filter({ has: page.getByText(`By ${currentYear + 1}`) })
      .getByRole("link", { name: "Grand Vin" });
    await drinkSoonItem.first().click();
    await expect(page).toHaveURL("/wines/1");
  });

  test("recent activity winemaker links to winemaker page", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/");

    // Find a winemaker link in recent activity
    const recentCard = page
      .locator("div")
      .filter({ has: page.getByText("Recent Activity") });
    const winemakerLink = recentCard
      .getByRole("link", { name: "Château Margaux" })
      .first();
    await winemakerLink.click();
    await expect(page).toHaveURL("/winemakers/1");
  });
});

test.describe("Dashboard empty states", () => {
  test.afterEach(async () => {
    await resetState();
  });

  test("shows empty state when no bottles exist", async ({ adminContext }) => {
    await setState({
      bottles: [],
      vintages: [],
      wines: [],
      winemakers: [],
      regions: [],
      countries: [],
      tastingNotes: [],
      grapes: [],
      wineGrapes: [],
    });

    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "CellarBoss Dashboard" }),
    ).toBeVisible();

    // Stat cards should show zeros
    await expect(page.getByText("Total Bottles")).toBeVisible();

    // Empty states for lists
    await expect(
      page.getByText("No bottles urgently need drinking"),
    ).toBeVisible();
    await expect(
      page.getByText("No recent activity in the last 30 days"),
    ).toBeVisible();
    await expect(
      page.getByText("Start rating your wines to see top picks here"),
    ).toBeVisible();
  });

  test("shows empty chart states with no stored bottles", async ({
    adminContext,
  }) => {
    await setState({
      bottles: [],
      vintages: [],
      wines: [],
      winemakers: [],
      regions: [],
      countries: [],
      tastingNotes: [],
      grapes: [],
      wineGrapes: [],
    });

    const page = await adminContext.newPage();
    await page.goto("/");

    await expect(
      page.getByText("Add some bottles to see your wine type breakdown"),
    ).toBeVisible();
    await expect(
      page.getByText("Add wines with regions to see country distribution"),
    ).toBeVisible();
  });
});
