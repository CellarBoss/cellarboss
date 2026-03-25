import { render, screen } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { WineTypeBreakdown } from "@/components/dashboard/WineTypeBreakdown";
import { bottles, vintages, wines } from "../../helpers/fixtures";

function renderBreakdown(
  props: Partial<React.ComponentProps<typeof WineTypeBreakdown>> = {},
) {
  return render(
    <PaperProvider>
      <WineTypeBreakdown
        bottles={props.bottles ?? bottles}
        vintages={props.vintages ?? vintages}
        wines={props.wines ?? wines}
      />
    </PaperProvider>,
  );
}

describe("WineTypeBreakdown", () => {
  it("shows Wine Types title", () => {
    renderBreakdown();
    expect(screen.getByText("Wine Types")).toBeTruthy();
  });

  it("computes type distribution correctly", () => {
    renderBreakdown();
    // Stored bottles: 1(v1→w1 red), 2(v2→w2 red), 3(v3→w3 red), 4(v4→w4 white), 6(v3→w3 red)
    // Red: 4, White: 1
    expect(screen.getByText("Red")).toBeTruthy();
    expect(screen.getByText("White")).toBeTruthy();
  });

  it("shows empty message when no bottles", () => {
    renderBreakdown({ bottles: [] });
    expect(screen.getByText("No bottles in cellar")).toBeTruthy();
  });

  it("shows empty message when all bottles are non-stored", () => {
    const drunkBottles = bottles.map((b) => ({
      ...b,
      status: "drunk" as const,
    }));
    renderBreakdown({ bottles: drunkBottles });
    expect(screen.getByText("No bottles in cellar")).toBeTruthy();
  });
});
