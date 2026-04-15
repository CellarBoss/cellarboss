import "../../helpers/mock-navigation";
import "../../helpers/mock-haptics";
import "../../helpers/mock-safe-area";
import { mockApi } from "../../helpers/mock-api-client";
import { mockOk, mockError } from "../../helpers/mock-api";
import { mockSearchParams } from "../../helpers/mock-navigation";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../helpers/test-utils";
import { wines } from "../../helpers/fixtures";

import EditWineScreen from "@/app/(app)/(tabs)/(dashboard,cellar,wines,storages,more)/wines/[id]/edit";

describe("EditWineScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.id = "1";
    mockApi.wines.getById.mockResolvedValue(mockOk(wines[0]));
    mockApi.winegrapes.getByWineId.mockResolvedValue(mockOk([]));
  });

  afterEach(() => {
    delete (mockSearchParams as Record<string, string>).id;
  });

  it("loads existing wine data", async () => {
    renderWithProviders(<EditWineScreen />);

    await waitFor(() => {
      expect(mockApi.wines.getById).toHaveBeenCalledWith(1);
    });
  });

  it("calls api.wines.update on save", async () => {
    mockApi.wines.update.mockResolvedValue(mockOk(wines[0]));

    renderWithProviders(<EditWineScreen />);

    await waitFor(() => {
      expect(screen.getByText("Save")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockApi.wines.update).toHaveBeenCalled();
    });
  });

  it("shows error on update failure", async () => {
    mockApi.wines.update.mockResolvedValue(mockError("Update failed"));

    renderWithProviders(<EditWineScreen />);

    await waitFor(() => {
      expect(screen.getByText("Save")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText(/Update failed/)).toBeTruthy();
    });
  });
});
