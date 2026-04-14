import "../helpers/mock-navigation";
import "../helpers/mock-haptics";
import "../helpers/mock-safe-area";
import { mockApi } from "../helpers/mock-api-client";
import { mockOk } from "../helpers/mock-api";
import { screen, waitFor } from "@testing-library/react-native";
import { renderWithProviders } from "../helpers/test-utils";
import {
  bottles,
  vintages,
  wines,
  winemakers,
  regions,
  countries,
  tastingNotes,
} from "../helpers/fixtures";

import DashboardScreen from "@/app/(app)/(tabs)/(dashboard)/index";

describe("DashboardScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.bottles.getAll.mockResolvedValue(mockOk(bottles));
    mockApi.vintages.getAll.mockResolvedValue(mockOk(vintages));
    mockApi.wines.getAll.mockResolvedValue(mockOk(wines));
    mockApi.winemakers.getAll.mockResolvedValue(mockOk(winemakers));
    mockApi.regions.getAll.mockResolvedValue(mockOk(regions));
    mockApi.countries.getAll.mockResolvedValue(mockOk(countries));
    mockApi.tastingNotes.getAll.mockResolvedValue(mockOk(tastingNotes));
    mockApi.settings.getAll.mockResolvedValue(mockOk([]));
  });

  it("renders dashboard with stats", async () => {
    renderWithProviders(<DashboardScreen />);

    // Wait for all queries to resolve and dashboard to render
    await waitFor(() => {
      // CellarOverviewStats should show "Bottles Stored" stat card
      expect(screen.getByText("Bottles Stored")).toBeTruthy();
    });
  });

  it("renders with empty data", async () => {
    mockApi.bottles.getAll.mockResolvedValue(mockOk([]));
    mockApi.vintages.getAll.mockResolvedValue(mockOk([]));
    mockApi.wines.getAll.mockResolvedValue(mockOk([]));
    mockApi.winemakers.getAll.mockResolvedValue(mockOk([]));
    mockApi.tastingNotes.getAll.mockResolvedValue(mockOk([]));

    renderWithProviders(<DashboardScreen />);

    await waitFor(() => {
      expect(screen.getByText("Bottles Stored")).toBeTruthy();
    });
  });
});
