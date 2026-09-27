import { test, expect, getState } from "../fixtures/auth";
import { saveForm } from "../fixtures/form";

test.describe("System settings", () => {
  test("edits a setting from the settings page", async ({
    adminPage: page,
  }) => {
    await page.goto("/settings");

    await page
      .getByText("currency", { exact: true })
      .locator("../..")
      .getByRole("button", { name: "Edit" })
      .click();
    await expect(page).toHaveURL("/settings/currency/edit");

    await expect(page.getByLabel("Setting Key")).toBeDisabled();
    const value = page.getByLabel("Value");
    await expect(value).toHaveValue("USD");
    await value.fill("EUR");
    await saveForm(page);
    await expect(page).toHaveURL("/settings");
    await expect(page.getByText("EUR", { exact: true })).toBeVisible();

    const { settings } = await getState();
    expect(settings).toContainEqual({ key: "currency", value: "EUR" });
  });

  test("a changed currency applies to bottle prices", async ({
    adminPage: page,
  }) => {
    await page.goto("/settings/currency/edit");
    await page.getByLabel("Value").fill("EUR");
    await saveForm(page);
    await expect(page).toHaveURL("/settings");

    await page.goto("/bottles");
    await expect(page.getByText("€150.00")).toBeVisible();
  });

  test("an unknown setting shows an error", async ({ adminPage: page }) => {
    await page.goto("/settings/nonexistent/edit");

    await expect(
      page.getByText("Setting 'nonexistent' not found"),
    ).toBeVisible();
  });
});
