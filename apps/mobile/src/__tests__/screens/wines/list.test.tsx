import "../../helpers/mock-navigation";
import "../../helpers/mock-haptics";
import "../../helpers/mock-safe-area";
import { mockApi } from "../../helpers/mock-api-client";
import { mockOk } from "../../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../helpers/test-utils";
import { mockRouter } from "../../helpers/mock-navigation";
import { wines, winemakers, regions, countries } from "../../helpers/fixtures";

// Mock gesture handler for swipeable
jest.mock("react-native-gesture-handler/ReanimatedSwipeable", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

import WinesScreen from "@/app/(app)/(tabs)/(wines)/wines";

describe("WinesScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.wines.getAll.mockResolvedValue(mockOk(wines));
    mockApi.winemakers.getAll.mockResolvedValue(mockOk(winemakers));
    mockApi.regions.getAll.mockResolvedValue(mockOk(regions));
    mockApi.countries.getAll.mockResolvedValue(mockOk(countries));
  });

  it("renders wine list items", async () => {
    renderWithProviders(<WinesScreen />);

    await waitFor(() => {
      expect(screen.getByText("Romanée-Conti Grand Cru")).toBeTruthy();
    });

    expect(screen.getByText("Château Margaux Premier Grand Cru")).toBeTruthy();
    expect(screen.getByText("Bin 389 Cabernet Shiraz")).toBeTruthy();
    expect(screen.getByText("Puligny-Montrachet")).toBeTruthy();
  });

  it("shows winemaker names", async () => {
    renderWithProviders(<WinesScreen />);

    await waitFor(() => {
      expect(
        screen.getAllByText(/Domaine de la Romanée-Conti/).length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows empty state when no wines", async () => {
    mockApi.wines.getAll.mockResolvedValue(mockOk([]));

    renderWithProviders(<WinesScreen />);

    await waitFor(() => {
      expect(screen.getByText("No wines yet")).toBeTruthy();
    });

    expect(screen.getByText("Add your first wine to get started")).toBeTruthy();
  });

  it("FAB navigates to new wine screen", async () => {
    renderWithProviders(<WinesScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("fab-add")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("fab-add"));
    expect(mockRouter.push).toHaveBeenCalledWith("/wines/new");
  });

  it("filters wines by search", async () => {
    renderWithProviders(<WinesScreen />);

    await waitFor(() => {
      expect(screen.getByText("Romanée-Conti Grand Cru")).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText("Search wines...");
    fireEvent.changeText(searchInput, "Margaux");

    expect(screen.getByText("Château Margaux Premier Grand Cru")).toBeTruthy();
    expect(screen.getByText("Rosé de Margaux")).toBeTruthy();
    expect(screen.queryByText("Romanée-Conti Grand Cru")).toBeNull();
  });

  it("search by winemaker name works", async () => {
    renderWithProviders(<WinesScreen />);

    await waitFor(() => {
      expect(screen.getByText("Romanée-Conti Grand Cru")).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText("Search wines...");
    fireEvent.changeText(searchInput, "Penfolds");

    expect(screen.getByText("Bin 389 Cabernet Shiraz")).toBeTruthy();
    expect(screen.queryByText("Romanée-Conti Grand Cru")).toBeNull();
  });

  it("tapping wine item navigates to detail", async () => {
    renderWithProviders(<WinesScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("wine-item-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("wine-item-1"));
    expect(mockRouter.push).toHaveBeenCalledWith("/wines/1");
  });
});
