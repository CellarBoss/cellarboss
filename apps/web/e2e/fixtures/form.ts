import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Locates a GenericCard form control by its visible label.
 *
 * GenericField wraps each label and its control in a `group`, so filtering
 * groups by label text is the way to target one control: the selector buttons
 * render their current selection as text content rather than as an accessible
 * name, so `getByRole("combobox", { name })` does not match them.
 *
 * `hasText` is a substring match, so this needs labels that are not prefixes of
 * each other within the same form.
 */
export function fieldCombobox(page: Page, label: string): Locator {
  return page
    .getByRole("group")
    .filter({ hasText: label })
    .getByRole("combobox");
}

/** Picks an option from a GenericCard single-select or fixed-list field. */
export async function chooseOption(
  page: Page,
  label: string,
  option: string,
): Promise<void> {
  await fieldCombobox(page, label).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

/** Submits a GenericCard form and waits for it to report success. */
export async function saveForm(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Changes saved successfully!")).toBeVisible();
}
