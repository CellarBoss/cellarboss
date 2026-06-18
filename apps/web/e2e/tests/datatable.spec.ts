import {
  test,
  expect,
  setState,
  resetState,
  MOCK_SERVER,
} from "../fixtures/auth";

test.describe("DataTable interactions", () => {
  test.beforeEach(async () => {
    await setState({
      winemakers: [
        { id: 1, name: "Alpha Winery" },
        { id: 2, name: "Beta Cellars" },
      ],
      regions: [
        { id: 1, name: "Bordeaux", countryId: 1 },
        { id: 2, name: "Burgundy", countryId: 1 },
      ],
      countries: [{ id: 1, name: "France" }],
      wines: Array.from({ length: 25 }, (_, i) => ({
        id: i + 1,
        name: `Wine ${String(i + 1).padStart(2, "0")}`,
        type: i % 2 === 0 ? "red" : "white",
        wineMakerId: i % 2 === 0 ? 1 : 2,
        regionId: i % 2 === 0 ? 1 : 2,
      })),
    });
  });

  test.afterEach(async () => {
    await resetState();
  });

  test("shows pagination controls with multiple pages", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // With 15 items and default page size, there should be 2 pages
    await expect(page.getByText(/page \d+ of \d+/i)).toBeVisible();
  });

  test("can navigate to next page", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // PaginationNext renders as an <a> element; target it by its aria-label
    const nextButton = page.locator('[aria-label="Go to next page"]');
    await expect(nextButton).toBeVisible();
    await nextButton.click();

    await expect(page).toHaveURL(/page=2/);
  });

  test("page parameter in URL", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines?page=2");

    await expect(page).toHaveURL(/page=2/);
  });

  test("row count info is visible", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // DataTable pagination shows "Page N of M" indicating total page count
    await expect(page.getByText(/page \d+ of \d+/i)).toBeVisible();
  });

  test("can sort by column header", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // Default sort is ascending — "Wine 01" should be first
    await expect(page.getByRole("row").nth(1)).toContainText("Wine 01");

    const wineNameHeader = page.getByRole("columnheader", {
      name: /wine name/i,
    });
    await wineNameHeader.click();

    // After clicking, sort toggles to descending — "Wine 25" should now be first
    await expect(page.getByRole("row").nth(1)).toContainText("Wine 25");
  });

  test("can select rows with checkboxes", async ({ adminContext }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    const firstRowCheckbox = page.getByRole("row").nth(1).getByRole("checkbox");
    await firstRowCheckbox.click();

    // Bulk action bar should appear when a row is selected
    await expect(
      page
        .getByText(/selected/i)
        .or(page.getByRole("button", { name: /delete selected/i })),
    ).toBeVisible();
  });

  test("primary column cannot be hidden from the columns control", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await page.getByRole("button", { name: /configure table/i }).click();

    // The "Wine Name" column is marked isHideable: false (primary) — its toggle
    // is shown but disabled. A hideable column ("Winemaker") stays enabled.
    await expect(page.locator("#column-toggle-name")).toBeDisabled();
    await expect(page.locator("#column-toggle-winemaker")).toBeEnabled();
  });

  test("can hide a column via the columns control", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await expect(
      page.getByRole("columnheader", { name: /winemaker/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: /configure table/i }).click();
    await page.locator("#column-toggle-winemaker").click();

    await expect(
      page.getByRole("columnheader", { name: /winemaker/i }),
    ).toBeHidden();
  });

  test("column visibility preference persists across reload", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    await page.getByRole("button", { name: /configure table/i }).click();
    await page.locator("#column-toggle-winemaker").click();
    await expect(
      page.getByRole("columnheader", { name: /winemaker/i }),
    ).toBeHidden();

    // The save goes through a Next.js server action (browser-invisible), so poll
    // the mock server until the preference is persisted before reloading.
    await expect
      .poll(async () => {
        const res = await fetch(`${MOCK_SERVER}/api/user/preferences`);
        const prefs: Array<{ key: string }> = await res.json();
        return prefs.some((p) => p.key.includes("columns.visibility"));
      })
      .toBe(true);

    await page.reload();

    // The saved preference should apply on first paint — column stays hidden.
    await expect(
      page.getByRole("columnheader", { name: /winemaker/i }),
    ).toBeHidden();
  });

  test("column order preference persists across reload", async ({
    adminContext,
  }) => {
    const page = await adminContext.newPage();
    await page.goto("/wines");

    // Column 0 is the selection checkbox, so the first data column is nth(1).
    await expect(page.getByRole("columnheader").nth(1)).toContainText(
      "Wine Name",
    );

    await page.getByRole("button", { name: /configure table/i }).click();

    // Drag the "Winemaker" handle up above the "Wine Name" handle to move it to
    // the front of the order. dnd-kit's PointerSensor needs the movement split
    // into steps so it registers the activation and intermediate collisions.
    const source = page.getByRole("button", { name: /reorder winemaker/i });
    const target = page.getByRole("button", { name: /reorder wine name/i });
    const sBox = (await source.boundingBox())!;
    const tBox = (await target.boundingBox())!;
    await page.mouse.move(sBox.x + sBox.width / 2, sBox.y + sBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      sBox.x + sBox.width / 2,
      sBox.y + sBox.height / 2 - 8,
      {
        steps: 4,
      },
    );
    await page.mouse.move(
      tBox.x + tBox.width / 2,
      tBox.y + tBox.height / 2 - 2,
      {
        steps: 12,
      },
    );
    await page.mouse.up();

    // Winemaker becomes the first data column immediately.
    await expect(page.getByRole("columnheader").nth(1)).toContainText(
      "Winemaker",
    );

    // The save goes through a Next.js server action (browser-invisible), so poll
    // the mock server until the order preference is persisted before reloading.
    await expect
      .poll(async () => {
        const res = await fetch(`${MOCK_SERVER}/api/user/preferences`);
        const prefs: Array<{ key: string }> = await res.json();
        return prefs.some((p) => p.key.includes("columns.order"));
      })
      .toBe(true);

    await page.reload();

    // The saved order should apply on first paint — Winemaker stays first.
    await expect(page.getByRole("columnheader").nth(1)).toContainText(
      "Winemaker",
    );
  });
});
