import "../../helpers/mock-navigation";
import "../../helpers/mock-haptics";
import "../../helpers/mock-safe-area";
import { mockApi } from "../../helpers/mock-api-client";
import { mockOk, mockError } from "../../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../helpers/test-utils";

import NewWineScreen from "@/app/(app)/(tabs)/wines/new";

describe("NewWineScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create form with expected fields", () => {
    renderWithProviders(<NewWineScreen />);

    expect(screen.getByText("New Wine")).toBeTruthy();
    expect(screen.getAllByText("Name").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Type").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Winemaker").length).toBeGreaterThanOrEqual(1);
  });

  it("shows success message after save", async () => {
    mockApi.wines.create.mockResolvedValue(
      mockOk({
        id: 6,
        name: "Test Wine",
        wineMakerId: 1,
        regionId: null,
        type: "red",
      }),
    );
    mockApi.winegrapes.create.mockResolvedValue(mockOk({}));

    renderWithProviders(<NewWineScreen />);

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockApi.wines.create).toHaveBeenCalled();
    });
  });

  it("shows error message on save failure", async () => {
    mockApi.wines.create.mockResolvedValue(mockError("Name is required"));

    renderWithProviders(<NewWineScreen />);

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText(/Name is required/)).toBeTruthy();
    });
  });

  it("renders back button", () => {
    renderWithProviders(<NewWineScreen />);
    expect(screen.getByText("Back")).toBeTruthy();
  });
});
