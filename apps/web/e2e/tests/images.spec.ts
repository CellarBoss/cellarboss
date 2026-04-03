import { test, expect, setState, resetState } from "../fixtures/auth";

const BASE_STATE = {
  winemakers: [{ id: 1, name: "Château Margaux" }],
  countries: [{ id: 1, name: "France" }],
  regions: [{ id: 1, name: "Bordeaux", countryId: 1 }],
  wines: [
    {
      id: 1,
      name: "Château Margaux",
      type: "red",
      wineMakerId: 1,
      regionId: 1,
    },
  ],
  vintages: [
    { id: 1, wineId: 1, year: 2015, drinkFrom: 2022, drinkUntil: 2035 },
  ],
  settings: [
    { key: "currency", value: "USD" },
    { key: "date", value: "yyyy-MM-dd" },
    { key: "datetime", value: "yyyy-MM-dd HH:mm" },
  ],
  images: [],
};

const SEED_IMAGE = {
  id: 1,
  vintageId: 1,
  filename: "test.jpg",
  size: 1024,
  isFavourite: false,
  createdBy: "admin-user-1",
  createdAt: "2024-06-15T10:00:00.000Z",
};

// Minimal valid JFIF JPEG bytes
const MINIMAL_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
]);

test.describe("Image gallery on vintage detail page", () => {
  test.beforeEach(async () => {
    await setState(BASE_STATE);
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("shows empty state when no images", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/vintages/1");

    await expect(page.getByText("No images yet")).toBeVisible();
  });

  test("shows upload cell", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/vintages/1");

    await expect(page.getByText("Upload")).toBeVisible();
  });

  test("uploading a file adds it to the gallery", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/vintages/1");

    await page.locator('input[type="file"]').setInputFiles({
      name: "photo.jpg",
      mimeType: "image/jpeg",
      buffer: MINIMAL_JPEG,
    });

    await expect(page.locator('img[src*="/api/image/"]')).toBeVisible();
  });

  test("delete button opens confirmation dialog", async ({ adminContext }) => {
    await setState({ images: [SEED_IMAGE] });
    const page = await adminContext.newPage();
    await page.goto("/vintages/1");

    // Hover to reveal the delete button
    await page.locator('img[src*="/api/image/"]').hover();
    await page.getByRole("button", { name: "Delete image" }).click();

    await expect(
      page.getByRole("alertdialog").getByText("Delete image"),
    ).toBeVisible();
  });

  test("confirming delete removes the image from the gallery", async ({
    adminContext,
  }) => {
    await setState({ images: [SEED_IMAGE] });
    const page = await adminContext.newPage();
    await page.goto("/vintages/1");

    await page.locator('img[src*="/api/image/"]').hover();
    await page.getByRole("button", { name: "Delete image" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete" })
      .click();

    await expect(page.getByText("No images yet")).toBeVisible();
  });

  test("cancelling delete dialog does not remove the image", async ({
    adminContext,
  }) => {
    await setState({ images: [SEED_IMAGE] });
    const page = await adminContext.newPage();
    await page.goto("/vintages/1");

    await page.locator('img[src*="/api/image/"]').hover();
    await page.getByRole("button", { name: "Delete image" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Cancel" })
      .click();

    await expect(page.locator('img[src*="/api/image/"]')).toBeVisible();
  });

  test("favourite button toggles favourite state", async ({ adminContext }) => {
    await setState({ images: [SEED_IMAGE] });
    const page = await adminContext.newPage();
    await page.goto("/vintages/1");

    await page.locator('img[src*="/api/image/"]').hover();
    await page.getByRole("button", { name: "Set as favourite" }).click();

    // After toggling, the button label should change
    await expect(
      page.getByRole("button", { name: "Unset favourite" }),
    ).toBeVisible();
  });
});
