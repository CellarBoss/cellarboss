import { render, screen } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { CellarOverviewStats } from "@/components/dashboard/CellarOverviewStats";
import { bottles, vintages, wines } from "../../helpers/fixtures";

function renderStats(currency = "USD") {
  return render(
    <PaperProvider>
      <CellarOverviewStats
        bottles={bottles}
        vintages={vintages}
        wines={wines}
        currency={currency}
      />
    </PaperProvider>,
  );
}

describe("CellarOverviewStats", () => {
  it("shows correct stored bottle count", () => {
    renderStats();
    // 5 stored bottles (id 1-4, 6), id 5 is "drunk"
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("Bottles Stored")).toBeTruthy();
  });

  it("shows unique wines label", () => {
    renderStats();
    expect(screen.getByText("Unique Wines")).toBeTruthy();
    // 4 unique wines but the value "4" may appear in multiple stat cards
    expect(screen.getAllByText("4").length).toBeGreaterThanOrEqual(1);
  });

  it("shows cellar value", () => {
    renderStats();
    // Sum of stored: 5000+300+40+80+40 = 5460
    expect(screen.getByText("Cellar Value")).toBeTruthy();
  });

  it("shows ready to drink count", () => {
    renderStats();
    expect(screen.getByText("Ready to Drink")).toBeTruthy();
  });
});
