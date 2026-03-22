import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { FilterSheet } from "@/components/FilterSheet";

const filters = [
  {
    key: "type",
    label: "Wine Type",
    options: [
      { label: "Red", value: "red" },
      { label: "White", value: "white" },
      { label: "Rosé", value: "rose" },
    ],
    multiple: true,
  },
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Stored", value: "stored" },
      { label: "Drunk", value: "drunk" },
    ],
    multiple: false,
  },
];

function renderFilterSheet(
  props: Partial<React.ComponentProps<typeof FilterSheet>> = {},
) {
  const defaultProps = {
    filters,
    values: { type: [], status: [] },
    onChange: jest.fn(),
    ...props,
  };

  return {
    ...render(
      <PaperProvider>
        <FilterSheet {...defaultProps} />
      </PaperProvider>,
    ),
    onChange: defaultProps.onChange,
  };
}

describe("FilterSheet", () => {
  it("shows Filters button", () => {
    renderFilterSheet();
    expect(screen.getByText("Filters")).toBeTruthy();
  });

  it("shows active count when filters are selected", () => {
    renderFilterSheet({ values: { type: ["red"], status: [] } });
    expect(screen.getByText("Filters (1)")).toBeTruthy();
  });

  it("opens modal showing filter options", () => {
    renderFilterSheet();
    fireEvent.press(screen.getByText("Filters"));

    expect(screen.getByText("Wine Type")).toBeTruthy();
    expect(screen.getByText("Red")).toBeTruthy();
    expect(screen.getByText("White")).toBeTruthy();
    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Stored")).toBeTruthy();
  });

  it("Apply button calls onChange with selections", () => {
    const { onChange } = renderFilterSheet();

    fireEvent.press(screen.getByText("Filters"));
    fireEvent.press(screen.getByText("Red"));
    fireEvent.press(screen.getByText("Apply"));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: ["red"] }),
    );
  });

  it("Clear All resets selections", () => {
    const { onChange } = renderFilterSheet({
      values: { type: ["red"], status: ["stored"] },
    });

    fireEvent.press(screen.getByText(/Filters/));
    fireEvent.press(screen.getByText("Clear All"));
    fireEvent.press(screen.getByText("Apply"));

    expect(onChange).toHaveBeenCalledWith({ type: [], status: [] });
  });
});
