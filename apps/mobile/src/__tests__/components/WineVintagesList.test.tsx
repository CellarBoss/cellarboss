import { mockRouter } from "../helpers/mock-navigation";
import { mockApi } from "../helpers/mock-api-client";
import { mockOk } from "../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../helpers/test-utils";
import type { BottleCounts, VintageDetail } from "@cellarboss/types";

import { WineVintagesList } from "@/components/wine/WineVintagesList";

const counts = (overrides: Partial<BottleCounts>): BottleCounts => ({
  ordered: 0,
  stored: 0,
  "in-primeur": 0,
  drunk: 0,
  sold: 0,
  gifted: 0,
  ...overrides,
});

const vintages: VintageDetail[] = [
  {
    id: 1,
    year: 2015,
    wineId: 1,
    drinkFrom: null,
    drinkUntil: null,
    tastingNotesCount: 0,
    bottles: counts({ stored: 3, drunk: 2 }),
  },
  {
    id: 2,
    year: 2018,
    wineId: 1,
    drinkFrom: null,
    drinkUntil: null,
    tastingNotesCount: 0,
    bottles: counts({ ordered: 1 }),
  },
];

describe("WineVintagesList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.vintages.getByWineId.mockResolvedValue(mockOk(vintages));
  });

  it("shows the stored bottle count embedded in each vintage", async () => {
    renderWithProviders(<WineVintagesList wineId={1} />);

    await waitFor(() => {
      expect(screen.getByText("2015")).toBeTruthy();
    });
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("0")).toBeTruthy();
    expect(mockApi.bottles.getAll).not.toHaveBeenCalled();
  });

  it("opens a vintage when pressed", async () => {
    renderWithProviders(<WineVintagesList wineId={1} />);

    await waitFor(() => {
      expect(screen.getByText("2018")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("2018"));
    expect(mockRouter.push).toHaveBeenCalledWith("/vintages/2");
  });
});
