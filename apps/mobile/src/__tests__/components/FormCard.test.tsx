import "../helpers/mock-navigation";
import "../helpers/mock-haptics";
import { screen, fireEvent, waitFor } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { FormCard } from "@/components/form/FormCard";
import { mockRouter } from "../helpers/mock-navigation";
import { renderWithProviders } from "../helpers/test-utils";
import type { FieldConfig } from "@/lib/types/field";

type TestEntity = { id: number; name: string; type: string };

const fields: FieldConfig<TestEntity>[] = [
  { key: "name", label: "Name", type: "text" },
  {
    key: "type",
    label: "Type",
    type: "fixed-list",
    options: [
      { label: "Red", value: "red" },
      { label: "White", value: "white" },
    ],
  },
];

function renderFormCard(
  props: Partial<React.ComponentProps<typeof FormCard<TestEntity>>> = {},
) {
  const defaultProps = {
    mode: "edit" as const,
    data: { id: 1, name: "Test Wine", type: "red" },
    fields,
    ...props,
  };

  return renderWithProviders(<FormCard {...defaultProps} />);
}

describe("FormCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Back button always", () => {
    renderFormCard({ mode: "view" });
    expect(screen.getByText("Back")).toBeTruthy();
  });

  it("does not render Save button in view mode", () => {
    renderFormCard({ mode: "view" });
    expect(screen.queryByText("Save")).toBeNull();
  });

  it("renders Save button in edit mode", () => {
    renderFormCard({ mode: "edit" });
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("renders Save button in create mode", () => {
    renderFormCard({ mode: "create" });
    expect(screen.getByText("Save")).toBeTruthy();
  });

  it("Back button navigates back", () => {
    renderFormCard();
    fireEvent.press(screen.getByText("Back"));
    expect(mockRouter.back).toHaveBeenCalled();
  });

  it("shows success message and triggers haptic on successful save", async () => {
    const processSave = jest.fn().mockResolvedValue({
      ok: true,
      data: { id: 1, name: "Test Wine", type: "red" },
    });

    renderFormCard({ processSave });
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Saved successfully!")).toBeTruthy();
    });

    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Success,
    );
    expect(processSave).toHaveBeenCalled();
  });

  it("shows error message on failed save", async () => {
    const processSave = jest.fn().mockResolvedValue({
      ok: false,
      error: { message: "Validation failed", errors: { name: "Required" } },
    });

    renderFormCard({ processSave });
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText(/Validation failed/)).toBeTruthy();
    });
  });

  it("shows error message when processSave throws", async () => {
    const processSave = jest.fn().mockRejectedValue(new Error("Network error"));

    renderFormCard({ processSave });
    fireEvent.press(screen.getByText("Save"));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeTruthy();
    });
  });
});
