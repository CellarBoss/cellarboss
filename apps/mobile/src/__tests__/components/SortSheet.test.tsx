import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { SortSheet } from "@/components/SortSheet";

const options = [
  { label: "Name (A-Z)", value: "name-asc" },
  { label: "Name (Z-A)", value: "name-desc" },
];

function renderSortSheet(
  props: Partial<React.ComponentProps<typeof SortSheet>> = {},
) {
  const defaultProps = {
    options,
    value: "name-asc",
    onChange: jest.fn(),
    ...props,
  };

  return {
    ...render(
      <PaperProvider>
        <SortSheet {...defaultProps} />
      </PaperProvider>,
    ),
    onChange: defaultProps.onChange,
  };
}

describe("SortSheet", () => {
  it("shows the current sort trigger", () => {
    renderSortSheet();
    expect(screen.getByLabelText("Sort, Name (A-Z)")).toBeTruthy();
  });

  it("opens modal showing sort options", () => {
    renderSortSheet();
    fireEvent.press(screen.getByLabelText("Sort, Name (A-Z)"));

    expect(screen.getByText("Sort By")).toBeTruthy();
    expect(screen.getByText("Name (A-Z)")).toBeTruthy();
    expect(screen.getByText("Name (Z-A)")).toBeTruthy();
  });

  it("Apply button calls onChange with the selected sort", () => {
    const { onChange } = renderSortSheet();

    fireEvent.press(screen.getByLabelText("Sort, Name (A-Z)"));
    fireEvent.press(screen.getByText("Name (Z-A)"));
    fireEvent.press(screen.getByText("Apply"));

    expect(onChange).toHaveBeenCalledWith("name-desc");
  });
});
