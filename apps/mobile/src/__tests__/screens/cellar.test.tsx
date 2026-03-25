import "../helpers/mock-navigation";
import "../helpers/mock-haptics";
import "../helpers/mock-safe-area";
import { mockApi } from "../helpers/mock-api-client";
import { mockOk } from "../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../helpers/test-utils";
import { mockRouter } from "../helpers/mock-navigation";
import {
  bottles,
  vintages,
  wines,
  winemakers,
  storages,
  locations,
} from "../helpers/fixtures";

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

import CellarScreen from "@/app/(app)/(tabs)/cellar";

describe("CellarScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default mock responses
    mockApi.bottles.getAll.mockResolvedValue(mockOk(bottles));
    mockApi.vintages.getAll.mockResolvedValue(mockOk(vintages));
    mockApi.wines.getAll.mockResolvedValue(mockOk(wines));
    mockApi.winemakers.getAll.mockResolvedValue(mockOk(winemakers));
    mockApi.storages.getAll.mockResolvedValue(mockOk(storages));
    mockApi.locations.getAll.mockResolvedValue(mockOk(locations));
  });

  it("renders bottle list items with wine names", async () => {
    renderWithProviders(<CellarScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Romanée-Conti Grand Cru/)).toBeTruthy();
    });

    expect(screen.getByText(/Château Margaux Premier Grand Cru/)).toBeTruthy();
    expect(screen.getAllByText(/Bin 389 Cabernet Shiraz/).length).toBe(2);
  });

  it("shows empty state when no bottles", async () => {
    mockApi.bottles.getAll.mockResolvedValue(mockOk([]));

    renderWithProviders(<CellarScreen />);

    await waitFor(() => {
      expect(screen.getByText("No bottles yet")).toBeTruthy();
    });

    expect(
      screen.getByText("Add your first bottle to get started"),
    ).toBeTruthy();
  });

  it("FAB navigates to new bottle screen", async () => {
    renderWithProviders(<CellarScreen />);

    await waitFor(() => {
      expect(screen.getByTestId("fab-add")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("fab-add"));
    expect(mockRouter.push).toHaveBeenCalledWith("/bottles/new");
  });

  it("filters bottles by search", async () => {
    renderWithProviders(<CellarScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Romanée-Conti Grand Cru/)).toBeTruthy();
    });

    const searchInput = screen.getByPlaceholderText("Search bottles...");
    fireEvent.changeText(searchInput, "Margaux");

    expect(screen.getByText(/Château Margaux Premier Grand Cru/)).toBeTruthy();
    expect(screen.queryByText(/Romanée-Conti Grand Cru/)).toBeNull();
  });
});
