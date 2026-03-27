import "../../helpers/mock-navigation";
import "../../helpers/mock-haptics";
import "../../helpers/mock-safe-area";
import { mockApi } from "../../helpers/mock-api-client";
import { mockOk, mockError } from "../../helpers/mock-api";
import { mockSearchParams } from "../../helpers/mock-navigation";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../helpers/test-utils";
import { bottles } from "../../helpers/fixtures";

import EditBottleScreen from "@/app/(app)/(tabs)/bottles/[id]/edit";

describe("EditBottleScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.id = "1";
    mockApi.bottles.getById.mockResolvedValue(mockOk(bottles[0]));
  });

  afterEach(() => {
    delete (mockSearchParams as Record<string, string>).id;
  });

  it("loads existing bottle data", async () => {
    renderWithProviders(<EditBottleScreen />);

    await waitFor(() => {
      expect(mockApi.bottles.getById).toHaveBeenCalledWith(1);
    });
  });

  it("calls api.bottles.update on save", async () => {
    mockApi.bottles.update.mockResolvedValue(mockOk(bottles[0]));

    renderWithProviders(<EditBottleScreen />);

    await waitFor(() => {
      expect(screen.getByText("Save")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockApi.bottles.update).toHaveBeenCalled();
    });
  });

  it("shows error on update failure", async () => {
    mockApi.bottles.update.mockResolvedValue(mockError("Update failed"));

    renderWithProviders(<EditBottleScreen />);

    await waitFor(() => {
      expect(screen.getByText("Save")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText(/Update failed/)).toBeTruthy();
    });
  });
});
