import { mockSearchParams } from "../../helpers/mock-navigation";
import "../../helpers/mock-haptics";
import "../../helpers/mock-safe-area";
import { mockApi } from "../../helpers/mock-api-client";
import { mockOk } from "../../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../helpers/test-utils";
import {
  storages,
  locations,
  bottles,
  vintages,
  wines,
  winemakers,
} from "../../helpers/fixtures";
import type { Bottle } from "@cellarboss/types";

import ViewStorageScreen from "@/app/(app)/(tabs)/(dashboard,cellar,wines,storages,more)/storages/[id]";

// Mock gesture handler for swipeable
jest.mock("react-native-gesture-handler/ReanimatedSwipeable", () => {
  const { View } =
    jest.requireActual<typeof import("react-native")>("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <View>{children}</View>
    ),
  };
});

// A bottle in "Shelf 1", which sits under "Rack A"
const shelfBottle: Bottle = {
  id: 7,
  purchaseDate: "2024-03-01",
  purchasePrice: 60,
  vintageId: 4,
  storageId: 3,
  status: "stored",
  size: "standard",
};

describe("ViewStorageScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.id = "1";
    mockApi.storages.getById.mockResolvedValue(mockOk(storages[0]));
    mockApi.storages.getAll.mockResolvedValue(mockOk(storages));
    mockApi.locations.getAll.mockResolvedValue(mockOk(locations));
    mockApi.bottles.getAll.mockResolvedValue(mockOk([...bottles, shelfBottle]));
    mockApi.vintages.getAll.mockResolvedValue(mockOk(vintages));
    mockApi.wines.getAll.mockResolvedValue(mockOk(wines));
    mockApi.winemakers.getAll.mockResolvedValue(mockOk(winemakers));
    mockApi.preferences.getAll.mockResolvedValue(mockOk([]));
    mockApi.preferences.upsert.mockResolvedValue(
      mockOk({ userId: "user-1", key: "k", value: "true" }),
    );
  });

  afterEach(() => {
    delete (mockSearchParams as Record<string, string>).id;
  });

  it("shows only direct bottles by default", async () => {
    renderWithProviders(<ViewStorageScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Romanée-Conti Grand Cru 2015/)).toBeTruthy();
    });
    expect(screen.queryByText(/Puligny-Montrachet 2019/)).toBeNull();
    expect(
      screen.getByText(/3 bottles stored · 4 including sub-storages/),
    ).toBeTruthy();
  });

  it("includes sub-storage bottles when the switch is turned on", async () => {
    renderWithProviders(<ViewStorageScreen />);

    const toggle = await screen.findByLabelText("Include sub-storages");
    fireEvent(toggle, "valueChange", true);

    await waitFor(() => {
      expect(screen.getByText(/Puligny-Montrachet 2019/)).toBeTruthy();
    });
    // Once in the sub-storages list and once as the bottle's location
    expect(screen.getAllByText("Shelf 1")).toHaveLength(2);
    expect(mockApi.preferences.upsert).toHaveBeenCalledWith(
      "storages.bottles.includeSubStorages",
      "true",
    );
  });

  it("uses the saved preference", async () => {
    mockApi.preferences.getAll.mockResolvedValue(
      mockOk([
        {
          userId: "user-1",
          key: "storages.bottles.includeSubStorages",
          value: "true",
        },
      ]),
    );

    renderWithProviders(<ViewStorageScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Puligny-Montrachet 2019/)).toBeTruthy();
    });
  });

  it("hides the switch when there are no sub-storages", async () => {
    mockSearchParams.id = "2";
    mockApi.storages.getById.mockResolvedValue(mockOk(storages[1]));

    renderWithProviders(<ViewStorageScreen />);

    await waitFor(() => {
      expect(screen.getByText(/Bin 389 Cabernet Shiraz 2020/)).toBeTruthy();
    });
    expect(screen.queryByLabelText("Include sub-storages")).toBeNull();
  });
});
