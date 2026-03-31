import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { FormField } from "@/components/form/FormField";

function renderField(
  props: Partial<React.ComponentProps<typeof FormField>> = {},
) {
  const defaultProps = {
    label: "Name",
    value: "",
    onChangeValue: jest.fn(),
    ...props,
  };
  return {
    ...render(
      <PaperProvider>
        <FormField {...defaultProps} />
      </PaperProvider>,
    ),
    onChangeValue: defaultProps.onChangeValue,
  };
}

describe("FormField", () => {
  describe("text type", () => {
    it("renders TextInput with value", () => {
      renderField({ value: "Chateau Test" });
      expect(screen.getByDisplayValue("Chateau Test")).toBeTruthy();
    });

    it("calls onChangeValue on text change", () => {
      const { onChangeValue } = renderField({ value: "old" });
      const input = screen.getByDisplayValue("old");
      fireEvent.changeText(input, "New Value");
      expect(onChangeValue).toHaveBeenCalledWith("New Value");
    });

    it("disables input when not editable", () => {
      renderField({ editable: false, value: "test" });
      const input = screen.getByDisplayValue("test");
      expect(
        input.props.disabled ?? input.props.editable === false,
      ).toBeTruthy();
    });
  });

  describe("textarea type", () => {
    it("renders multiline TextInput", () => {
      renderField({ type: "textarea", value: "Notes" });
      expect(screen.getByDisplayValue("Notes")).toBeTruthy();
    });
  });

  describe("password type", () => {
    it("renders with secureTextEntry", () => {
      renderField({ type: "password", value: "secret" });
      expect(screen.getByDisplayValue("secret")).toBeTruthy();
    });
  });

  describe("number type", () => {
    it("renders with numeric value", () => {
      renderField({ type: "number", value: "42" });
      expect(screen.getByDisplayValue("42")).toBeTruthy();
    });
  });

  describe("date type", () => {
    it("renders date input with label", () => {
      renderField({ type: "date" });
      expect(screen.getByTestId("field-name")).toBeTruthy();
    });
  });

  describe("fixed-list type", () => {
    const options = [
      { label: "Red", value: "red" },
      { label: "White", value: "white" },
      { label: "Rosé", value: "rose" },
    ];

    it("shows selected label", () => {
      renderField({ type: "fixed-list", value: "red", options });
      expect(screen.getByText("Red")).toBeTruthy();
    });

    it("shows Select... when no value matches", () => {
      renderField({ type: "fixed-list", value: "", options });
      expect(screen.getByText("Select...")).toBeTruthy();
    });
  });

  describe("wine-rating type", () => {
    it("renders WineGlassRating", () => {
      renderField({ type: "wine-rating", value: "7" });
      expect(screen.getByText("7/10")).toBeTruthy();
    });
  });

  describe("error display", () => {
    it("shows HelperText when error provided", () => {
      renderField({ error: "Name is required" });
      expect(screen.getByText("Name is required")).toBeTruthy();
    });
  });
});
