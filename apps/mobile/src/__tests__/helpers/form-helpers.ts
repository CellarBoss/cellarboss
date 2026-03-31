import { screen, fireEvent, waitFor, act } from "@testing-library/react-native";

/**
 * Select an item from a DataSelector by opening its modal and pressing the item.
 * @param selectorLabel - The label of the selector (used in testID: `selector-{label}`)
 * @param itemName - The display name of the item to select
 */
export async function selectDataSelectorItem(
  selectorLabel: string,
  itemName: string,
) {
  const testId = `selector-${selectorLabel.toLowerCase().replace(/\s+/g, "-")}`;
  fireEvent.press(screen.getByTestId(testId));

  await waitFor(() => {
    expect(screen.getByText(itemName)).toBeTruthy();
  });

  fireEvent.press(screen.getByText(itemName));
}

/**
 * Select a wine and vintage through the WineVintageSelector.
 * @param wineName - Display name of the wine to select
 * @param vintageYear - The vintage year string to select (e.g., "2015")
 */
export async function selectWineVintage(wineName: string, vintageYear: string) {
  // Open wine modal
  fireEvent.press(screen.getByText("Choose a wine..."));

  // Wait for wine list to load and select wine
  await waitFor(() => {
    expect(screen.getByText(wineName)).toBeTruthy();
  });
  fireEvent.press(screen.getByText(wineName));

  // Wait for vintage modal to appear (after 300ms setTimeout in component)
  await waitFor(() => {
    expect(screen.getByText(vintageYear)).toBeTruthy();
  });
  fireEvent.press(screen.getByText(vintageYear));
}
