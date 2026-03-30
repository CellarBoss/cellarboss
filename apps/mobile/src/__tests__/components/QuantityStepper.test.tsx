import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { QuantityStepper } from "@/components/form/QuantityStepper";

function renderStepper(
  props: Partial<React.ComponentProps<typeof QuantityStepper>> = {},
) {
  const defaultProps = {
    label: "Quantity",
    value: "1",
    onChangeValue: jest.fn(),
    ...props,
  };
  return {
    ...render(
      <PaperProvider>
        <QuantityStepper {...defaultProps} />
      </PaperProvider>,
    ),
    onChangeValue: defaultProps.onChangeValue,
  };
}

describe("QuantityStepper", () => {
  it("renders the label", () => {
    renderStepper();
    expect(screen.getByText("Quantity")).toBeTruthy();
  });

  it("displays the current value", () => {
    renderStepper({ value: "6" });
    expect(screen.getAllByText("6").length).toBeGreaterThanOrEqual(1);
  });

  it("increments when + is pressed", () => {
    const { onChangeValue } = renderStepper({ value: "3" });
    fireEvent.press(screen.getByText("+"));
    expect(onChangeValue).toHaveBeenCalledWith("4");
  });

  it("decrements when − is pressed", () => {
    const { onChangeValue } = renderStepper({ value: "3" });
    fireEvent.press(screen.getByText("−"));
    expect(onChangeValue).toHaveBeenCalledWith("2");
  });

  it("does not go below 1", () => {
    const { onChangeValue } = renderStepper({ value: "1" });
    fireEvent.press(screen.getByText("−"));
    expect(onChangeValue).toHaveBeenCalledWith("1");
  });

  it("sets value when a shortcut is pressed", () => {
    const { onChangeValue } = renderStepper({ value: "1" });
    fireEvent.press(screen.getByText("12"));
    expect(onChangeValue).toHaveBeenCalledWith("12");
  });

  it("shows error message", () => {
    renderStepper({ error: "Required" });
    expect(screen.getByText("Required")).toBeTruthy();
  });
});
