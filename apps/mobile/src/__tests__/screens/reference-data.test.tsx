import "../helpers/mock-navigation";
import "../helpers/mock-haptics";
import "../helpers/mock-safe-area";
import { mockApi } from "../helpers/mock-api-client";
import { mockOk, mockError } from "../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../helpers/test-utils";
import { mockRouter } from "../helpers/mock-navigation";
import {
  bottles,
  countries,
  regions,
  winemakers,
  grapes,
  locations,
  storages,
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

// Import all list screens
import CountriesScreen from "@/app/(app)/countries/index";
import NewCountryScreen from "@/app/(app)/countries/new";
import RegionsScreen from "@/app/(app)/regions/index";
import NewRegionScreen from "@/app/(app)/regions/new";
import WinemakersScreen from "@/app/(app)/winemakers/index";
import NewWinemakerScreen from "@/app/(app)/winemakers/new";
import GrapesScreen from "@/app/(app)/grapes/index";
import NewGrapeScreen from "@/app/(app)/grapes/new";
import LocationsScreen from "@/app/(app)/locations/index";
import NewLocationScreen from "@/app/(app)/locations/new";
import StoragesScreen from "@/app/(app)/(tabs)/storages";
import NewStorageScreen from "@/app/(app)/storages/new";

describe("Reference Data Screens", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore all default mock values
    mockApi.countries.getAll.mockResolvedValue(mockOk(countries));
    mockApi.regions.getAll.mockResolvedValue(mockOk(regions));
    mockApi.winemakers.getAll.mockResolvedValue(mockOk(winemakers));
    mockApi.grapes.getAll.mockResolvedValue(mockOk(grapes));
    mockApi.locations.getAll.mockResolvedValue(mockOk(locations));
    mockApi.storages.getAll.mockResolvedValue(mockOk(storages));
    mockApi.bottles.getAll.mockResolvedValue(mockOk(bottles));
  });

  // --- Countries ---
  describe("CountriesScreen", () => {
    it("renders country list", async () => {
      renderWithProviders(<CountriesScreen />);

      await waitFor(() => {
        expect(screen.getByText("France")).toBeTruthy();
      });
      expect(screen.getByText("Australia")).toBeTruthy();
      expect(screen.getByText("Italy")).toBeTruthy();
    });

    it("shows empty state", async () => {
      mockApi.countries.getAll.mockResolvedValue(mockOk([]));
      renderWithProviders(<CountriesScreen />);

      await waitFor(() => {
        expect(screen.getByText("No countries yet")).toBeTruthy();
      });
    });

    it("FAB navigates to new country", async () => {
      renderWithProviders(<CountriesScreen />);

      await waitFor(() => {
        expect(screen.getByTestId("fab-add")).toBeTruthy();
      });
      fireEvent.press(screen.getByTestId("fab-add"));
      expect(mockRouter.push).toHaveBeenCalledWith("/countries/new");
    });

    it("filters by search", async () => {
      renderWithProviders(<CountriesScreen />);

      await waitFor(() => {
        expect(screen.getByText("France")).toBeTruthy();
      });

      fireEvent.changeText(
        screen.getByPlaceholderText("Search countries..."),
        "Aus",
      );
      expect(screen.getByText("Australia")).toBeTruthy();
      expect(screen.queryByText("France")).toBeNull();
    });
  });

  describe("NewCountryScreen", () => {
    it("renders create form", () => {
      renderWithProviders(<NewCountryScreen />);
      expect(screen.getByText("New Country")).toBeTruthy();
      expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    });

    it("saves successfully", async () => {
      mockApi.countries.create.mockResolvedValue(
        mockOk({ id: 4, name: "Spain" }),
      );
      renderWithProviders(<NewCountryScreen />);

      fireEvent.press(screen.getByText("Save"));

      await waitFor(() => {
        expect(mockApi.countries.create).toHaveBeenCalled();
      });
    });

    it("shows error on failure", async () => {
      mockApi.countries.create.mockResolvedValue(mockError("Name is required"));
      renderWithProviders(<NewCountryScreen />);

      fireEvent.press(screen.getByText("Save"));

      await waitFor(() => {
        expect(screen.getByText(/Name is required/)).toBeTruthy();
      });
    });
  });

  // --- Regions ---
  describe("RegionsScreen", () => {
    it("renders region list with country info", async () => {
      renderWithProviders(<RegionsScreen />);

      await waitFor(() => {
        expect(screen.getByText("Burgundy")).toBeTruthy();
      });
      expect(screen.getByText("Bordeaux")).toBeTruthy();
      expect(screen.getByText("Barossa Valley")).toBeTruthy();
    });

    it("shows empty state", async () => {
      mockApi.regions.getAll.mockResolvedValue(mockOk([]));
      renderWithProviders(<RegionsScreen />);

      await waitFor(() => {
        expect(screen.getByText("No regions yet")).toBeTruthy();
      });
    });
  });

  describe("NewRegionScreen", () => {
    it("renders create form with country selector", () => {
      renderWithProviders(<NewRegionScreen />);
      expect(screen.getByText("New Region")).toBeTruthy();
      expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Country").length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- Winemakers ---
  describe("WinemakersScreen", () => {
    it("renders winemaker list", async () => {
      renderWithProviders(<WinemakersScreen />);

      await waitFor(() => {
        expect(screen.getByText("Domaine de la Romanée-Conti")).toBeTruthy();
      });
      expect(screen.getByText("Château Margaux")).toBeTruthy();
      expect(screen.getByText("Penfolds")).toBeTruthy();
    });

    it("shows empty state", async () => {
      mockApi.winemakers.getAll.mockResolvedValue(mockOk([]));
      renderWithProviders(<WinemakersScreen />);

      await waitFor(() => {
        expect(screen.getByText("No winemakers yet")).toBeTruthy();
      });
    });
  });

  describe("NewWinemakerScreen", () => {
    it("renders create form", () => {
      renderWithProviders(<NewWinemakerScreen />);
      expect(screen.getByText("New Winemaker")).toBeTruthy();
      expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    });

    it("saves successfully", async () => {
      mockApi.winemakers.create.mockResolvedValue(
        mockOk({ id: 4, name: "Test Winemaker" }),
      );
      renderWithProviders(<NewWinemakerScreen />);

      fireEvent.press(screen.getByText("Save"));

      await waitFor(() => {
        expect(mockApi.winemakers.create).toHaveBeenCalled();
      });
    });
  });

  // --- Grapes ---
  describe("GrapesScreen", () => {
    it("renders grape list", async () => {
      renderWithProviders(<GrapesScreen />);

      await waitFor(() => {
        expect(screen.getByText("Pinot Noir")).toBeTruthy();
      });
      expect(screen.getByText("Cabernet Sauvignon")).toBeTruthy();
      expect(screen.getByText("Chardonnay")).toBeTruthy();
    });

    it("shows empty state", async () => {
      mockApi.grapes.getAll.mockResolvedValue(mockOk([]));
      renderWithProviders(<GrapesScreen />);

      await waitFor(() => {
        expect(screen.getByText("No grapes yet")).toBeTruthy();
      });
    });
  });

  describe("NewGrapeScreen", () => {
    it("renders create form", () => {
      renderWithProviders(<NewGrapeScreen />);
      expect(screen.getByText("New Grape")).toBeTruthy();
      expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- Locations ---
  describe("LocationsScreen", () => {
    it("renders location list", async () => {
      renderWithProviders(<LocationsScreen />);

      await waitFor(() => {
        expect(screen.getByText("Home Cellar")).toBeTruthy();
      });
      expect(screen.getByText("Wine Fridge")).toBeTruthy();
    });

    it("shows empty state", async () => {
      mockApi.locations.getAll.mockResolvedValue(mockOk([]));
      renderWithProviders(<LocationsScreen />);

      await waitFor(() => {
        expect(screen.getByText("No locations yet")).toBeTruthy();
      });
    });
  });

  describe("NewLocationScreen", () => {
    it("renders create form", () => {
      renderWithProviders(<NewLocationScreen />);
      expect(screen.getByText("New Location")).toBeTruthy();
      expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    });
  });

  // --- Storages ---
  describe("StoragesScreen", () => {
    it("renders storage list", async () => {
      renderWithProviders(<StoragesScreen />);

      await waitFor(() => {
        expect(screen.getByText("Rack A")).toBeTruthy();
      });
      expect(screen.getByText("Rack B")).toBeTruthy();
      expect(screen.getByText("Shelf 1")).toBeTruthy();
    });

    it("shows empty state", async () => {
      mockApi.storages.getAll.mockResolvedValue(mockOk([]));
      renderWithProviders(<StoragesScreen />);

      await waitFor(() => {
        expect(screen.getByText("No storages yet")).toBeTruthy();
      });
    });
  });

  describe("NewStorageScreen", () => {
    it("renders create form with location and parent selectors", () => {
      renderWithProviders(<NewStorageScreen />);
      expect(screen.getByText("New Storage")).toBeTruthy();
      expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Location").length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getAllByText("Parent Storage").length,
      ).toBeGreaterThanOrEqual(1);
    });
  });
});
