import type { Page } from "@playwright/test";
import { test, expect, setState, getState } from "../fixtures/auth";
import { saveForm } from "../fixtures/form";

// Countries, grapes, locations and winemakers share the same name-only form,
// list and detail page layout, so one set of create/edit/delete tests covers
// all four.
const RESOURCES = [
  {
    path: "countries",
    subject: "Country",
    heading: "Countries",
    stateKey: "countries",
    related: "No regions yet",
  },
  {
    path: "grapes",
    subject: "Grape",
    heading: "Grapes",
    stateKey: "grapes",
    related: "No wines use this grape yet",
  },
  {
    path: "locations",
    subject: "Location",
    heading: "Locations",
    stateKey: "locations",
    related: "No storages yet",
  },
  {
    path: "winemakers",
    subject: "Winemaker",
    heading: "Winemakers",
    stateKey: "winemakers",
    related: "No wines yet",
  },
] as const;

type Named = { id: number; name: string };

async function namesInState(key: (typeof RESOURCES)[number]["stateKey"]) {
  const state = await getState();
  return (state[key] as Named[]).map((r) => r.name).sort();
}

function row(page: Page, name: string) {
  return page.getByRole("row").filter({ hasText: name });
}

for (const resource of RESOURCES) {
  test.describe(`${resource.heading} CRUD`, () => {
    test.beforeEach(async () => {
      await setState({
        // Nothing refers to the seeded records, so detail pages show their
        // empty related-records message
        wines: [],
        wineGrapes: [],
        regions: [],
        storages: [],
        [resource.stateKey]: [
          { id: 1, name: "Alpha" },
          { id: 2, name: "Bravo" },
        ],
      });
    });

    test("lists every record", async ({ adminPage: page }) => {
      await page.goto(`/${resource.path}`);

      await expect(
        page.getByRole("heading", { name: resource.heading }),
      ).toBeVisible();
      await expect(page.getByRole("link", { name: "Alpha" })).toBeVisible();
      await expect(page.getByRole("link", { name: "Bravo" })).toBeVisible();
    });

    test("creates a record from the list page", async ({ adminPage: page }) => {
      await page.goto(`/${resource.path}`);
      await page
        .getByRole("button", { name: `Create new ${resource.subject}` })
        .click();
      await expect(page).toHaveURL(`/${resource.path}/new`);

      await page.getByLabel("Name").fill("Charlie");
      await saveForm(page);
      await expect(page).toHaveURL(`/${resource.path}`);
      await expect(page.getByRole("link", { name: "Charlie" })).toBeVisible();
      expect(await namesInState(resource.stateKey)).toEqual([
        "Alpha",
        "Bravo",
        "Charlie",
      ]);
    });

    test("will not save without a name", async ({ adminPage: page }) => {
      await page.goto(`/${resource.path}/new`);

      await page.getByRole("button", { name: "Save" }).click();

      await expect(page.locator("[data-invalid=true]")).toBeVisible();
      await expect(page.getByText("Changes saved successfully!")).toBeHidden();
      expect(await namesInState(resource.stateKey)).toEqual(["Alpha", "Bravo"]);
    });

    test("edits a record from the list page", async ({ adminPage: page }) => {
      await page.goto(`/${resource.path}`);
      await row(page, "Alpha").getByRole("button", { name: "Edit" }).click();
      await expect(page).toHaveURL(`/${resource.path}/1/edit`);

      const name = page.getByLabel("Name");
      await expect(name).toHaveValue("Alpha");
      await name.fill("Alpha Prime");
      await saveForm(page);

      await expect(page).toHaveURL(`/${resource.path}`);
      await expect(
        page.getByRole("link", { name: "Alpha Prime" }),
      ).toBeVisible();
      expect(await namesInState(resource.stateKey)).toEqual([
        "Alpha Prime",
        "Bravo",
      ]);
    });

    test("deletes a record from the list after confirming", async ({
      adminPage: page,
    }) => {
      await page.goto(`/${resource.path}`);
      await row(page, "Alpha").getByRole("button", { name: "Delete" }).click();

      const dialog = page.getByRole("alertdialog");
      await expect(dialog).toContainText("Alpha");
      await dialog.getByRole("button", { name: "Continue" }).click();

      await expect(page.getByRole("link", { name: "Alpha" })).toBeHidden();
      await expect(page.getByRole("link", { name: "Bravo" })).toBeVisible();
      expect(await namesInState(resource.stateKey)).toEqual(["Bravo"]);
    });

    test("cancelling the delete dialog keeps the record", async ({
      adminPage: page,
    }) => {
      await page.goto(`/${resource.path}`);
      await row(page, "Alpha").getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Cancel" })
        .click();

      await expect(page.getByRole("alertdialog")).toBeHidden();
      await expect(page.getByRole("link", { name: "Alpha" })).toBeVisible();
      expect(await namesInState(resource.stateKey)).toEqual(["Alpha", "Bravo"]);
    });

    test("bulk deletes the selected records", async ({ adminPage: page }) => {
      await page.goto(`/${resource.path}`);
      await row(page, "Alpha").getByRole("checkbox").click();
      await row(page, "Bravo").getByRole("checkbox").click();

      await page
        .getByText("2 selected")
        .locator("..")
        .getByRole("button", { name: "Delete" })
        .click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Delete" })
        .click();

      await expect(page.getByText("No results.")).toBeVisible();
      expect(await namesInState(resource.stateKey)).toEqual([]);
    });

    test("detail page shows the record and deletes it", async ({
      adminPage: page,
    }) => {
      await page.goto(`/${resource.path}`);
      await page.getByRole("link", { name: "Bravo" }).click();

      await expect(page).toHaveURL(`/${resource.path}/2`);
      await expect(page.getByRole("heading", { name: "Bravo" })).toBeVisible();
      await expect(page.getByText(resource.related)).toBeVisible();

      await page.getByRole("button", { name: "Delete" }).click();
      await page
        .getByRole("alertdialog")
        .getByRole("button", { name: "Continue" })
        .click();

      await expect(page).toHaveURL(`/${resource.path}`);
      expect(await namesInState(resource.stateKey)).toEqual(["Alpha"]);
    });
  });
}
