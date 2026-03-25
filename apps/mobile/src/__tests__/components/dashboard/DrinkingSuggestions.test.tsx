import { render, screen } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { DrinkingSuggestions } from "@/components/dashboard/DrinkingSuggestions";
import { bottles, vintages, wines, winemakers } from "../../helpers/fixtures";

function renderSuggestions(
  props: Partial<React.ComponentProps<typeof DrinkingSuggestions>> = {},
) {
  return render(
    <PaperProvider>
      <DrinkingSuggestions
        bottles={props.bottles ?? bottles}
        vintages={props.vintages ?? vintages}
        wines={props.wines ?? wines}
        winemakers={props.winemakers ?? winemakers}
      />
    </PaperProvider>,
  );
}

describe("DrinkingSuggestions", () => {
  it("shows Drink Soon title", () => {
    renderSuggestions();
    expect(screen.getByText("Drink Soon")).toBeTruthy();
  });

  it("shows urgent bottles within drinking window", () => {
    // Current year ~2026, drinkUntil <= 2028:
    // vintage 3 (drinkUntil 2027, wineId 3 "Bin 389"), vintage 4 (drinkUntil 2026, wineId 4 "Puligny-Montrachet")
    // vintage 5 (drinkUntil 2024) is "drunk" so not stored → not shown
    renderSuggestions();

    // These wines have stored bottles with drinkUntil <= currentYear + 2
    expect(screen.getByText(/Bin 389/)).toBeTruthy();
    expect(screen.getByText(/Puligny-Montrachet/)).toBeTruthy();
  });

  it("shows empty message when no urgent bottles", () => {
    const farFutureVintages = vintages.map((v) => ({
      ...v,
      drinkUntil: 2099,
    }));
    renderSuggestions({ vintages: farFutureVintages });
    expect(screen.getByText("No urgent bottles at the moment")).toBeTruthy();
  });

  it("shows empty message when no stored bottles", () => {
    renderSuggestions({ bottles: [] });
    expect(screen.getByText("No urgent bottles at the moment")).toBeTruthy();
  });

  it("shows winemaker name", () => {
    renderSuggestions();
    // Bin 389 → winemaker Penfolds
    expect(screen.getByText("Penfolds")).toBeTruthy();
  });
});
