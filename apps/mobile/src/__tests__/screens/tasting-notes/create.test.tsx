import "../../helpers/mock-navigation";
import "../../helpers/mock-haptics";
import "../../helpers/mock-safe-area";
import { mockApi } from "../../helpers/mock-api-client";
import { mockOk, mockError } from "../../helpers/mock-api";
import { screen, waitFor, fireEvent } from "@testing-library/react-native";
import { renderWithProviders } from "../../helpers/test-utils";
import { selectWineVintage } from "../../helpers/form-helpers";

import NewTastingNoteScreen from "@/app/(app)/(tabs)/tasting-notes/new";

async function fillRequiredFields() {
  await selectWineVintage("Romanée-Conti Grand Cru", "2015");
}

describe("NewTastingNoteScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders create form with expected fields", () => {
    renderWithProviders(<NewTastingNoteScreen />);

    expect(screen.getByText("New Tasting Note")).toBeTruthy();
    expect(screen.getAllByText("Score").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Notes").length).toBeGreaterThanOrEqual(1);
  });

  it("calls api.tastingNotes.create on save", async () => {
    mockApi.tastingNotes.create.mockResolvedValue(
      mockOk({
        id: 3,
        vintageId: 1,
        date: "2025-03-25T12:00:00Z",
        authorId: "user-1",
        author: "Admin User",
        score: 8,
        notes: "Great wine",
      }),
    );

    renderWithProviders(<NewTastingNoteScreen />);

    await fillRequiredFields();
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockApi.tastingNotes.create).toHaveBeenCalled();
    });
  });

  it("shows success message after save", async () => {
    mockApi.tastingNotes.create.mockResolvedValue(
      mockOk({
        id: 3,
        vintageId: 1,
        date: "2025-03-25T12:00:00Z",
        authorId: "user-1",
        author: "Admin User",
        score: 8,
        notes: "Great wine",
      }),
    );

    renderWithProviders(<NewTastingNoteScreen />);

    await fillRequiredFields();
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Saved successfully!")).toBeTruthy();
    });
  });

  it("shows error on save failure", async () => {
    mockApi.tastingNotes.create.mockResolvedValue(
      mockError("Score must be between 0 and 10"),
    );

    renderWithProviders(<NewTastingNoteScreen />);

    await fillRequiredFields();
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText(/Score must be between 0 and 10/)).toBeTruthy();
    });
  });

  it("renders back button", () => {
    renderWithProviders(<NewTastingNoteScreen />);
    expect(screen.getByText("Back")).toBeTruthy();
  });
});
