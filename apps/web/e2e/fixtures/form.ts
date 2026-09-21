import type { Locator, Page } from "@playwright/test";

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
