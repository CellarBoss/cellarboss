import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import * as Haptics from "expo-haptics";
import { ConfirmDialog } from "@/components/ConfirmDialog";

function renderDialog(
  props: Partial<React.ComponentProps<typeof ConfirmDialog>> = {},
) {
  const defaultProps = {
    visible: true,
    title: "Delete Wine",
    message: "Are you sure you want to delete this wine?",
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    ...props,
  };

  return {
    ...render(
      <PaperProvider>
        <ConfirmDialog {...defaultProps} />
      </PaperProvider>,
    ),
    onConfirm: defaultProps.onConfirm,
    onCancel: defaultProps.onCancel,
  };
}

describe("ConfirmDialog", () => {
  it("shows title and message when visible", () => {
    renderDialog();
    expect(screen.getByText("Delete Wine")).toBeTruthy();
    expect(
      screen.getByText("Are you sure you want to delete this wine?"),
    ).toBeTruthy();
  });

  it("calls onCancel when cancel button pressed", () => {
    const { onCancel } = renderDialog();
    fireEvent.press(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirm and triggers haptics when confirm pressed", () => {
    const { onConfirm } = renderDialog();
    fireEvent.press(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledWith(
      Haptics.NotificationFeedbackType.Warning,
    );
  });

  it("uses custom labels", () => {
    renderDialog({ confirmLabel: "Yes", cancelLabel: "No" });
    expect(screen.getByText("Yes")).toBeTruthy();
    expect(screen.getByText("No")).toBeTruthy();
  });

  it("does not trigger haptics when not destructive", () => {
    (Haptics.notificationAsync as jest.Mock).mockClear();
    const { onConfirm } = renderDialog({ destructive: false });
    fireEvent.press(screen.getByText("Delete"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
  });
});
