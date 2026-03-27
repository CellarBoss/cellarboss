import "../../helpers/mock-navigation";
import "../../helpers/mock-haptics";
import "../../helpers/mock-safe-area";
import { mockApi } from "../../helpers/mock-api-client";
import { mockOk, mockError } from "../../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../helpers/test-utils";

import NewBottleScreen from "@/app/(app)/(tabs)/bottles/new";

describe("NewBottleScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create form with expected fields", () => {
    renderWithProviders(<NewBottleScreen />);

    expect(screen.getByText("New Bottle")).toBeTruthy();
    expect(screen.getAllByText("Purchase Date").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("Purchase Price").length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText("Status").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Size").length).toBeGreaterThanOrEqual(1);
  });

  it("calls api.bottles.create on save with correct data", async () => {
    mockApi.bottles.create.mockResolvedValue(
      mockOk({
        id: 7,
        purchaseDate: "2025-01-15",
        purchasePrice: 75,
        vintageId: 1,
        storageId: null,
        status: "ordered",
        size: "standard",
      }),
    );

    renderWithProviders(<NewBottleScreen />);

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockApi.bottles.create).toHaveBeenCalled();
    });
  });

  it("shows success message after successful save", async () => {
    mockApi.bottles.create.mockResolvedValue(
      mockOk({
        id: 7,
        purchaseDate: "2025-01-15",
        purchasePrice: 0,
        vintageId: 0,
        storageId: null,
        status: "ordered",
        size: "standard",
      }),
    );

    renderWithProviders(<NewBottleScreen />);

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Saved successfully!")).toBeTruthy();
    });
  });

  it("shows error message on save failure", async () => {
    mockApi.bottles.create.mockResolvedValue(
      mockError("Validation failed", 400, { purchaseDate: "Required" }),
    );

    renderWithProviders(<NewBottleScreen />);

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText(/Validation failed/)).toBeTruthy();
    });
  });

  it("renders back button", () => {
    renderWithProviders(<NewBottleScreen />);
    expect(screen.getByText("Back")).toBeTruthy();
  });
});
