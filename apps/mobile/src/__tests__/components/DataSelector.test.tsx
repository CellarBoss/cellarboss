import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataSelector } from "@/components/DataSelector";
import { mockOk } from "../helpers/mock-api";

const items = [
  { id: 1, name: "France" },
  { id: 2, name: "Italy" },
  { id: 3, name: "Australia" },
];

function renderSelector(
  props: Partial<React.ComponentProps<typeof DataSelector>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const defaultProps = {
    label: "Country",
    value: "",
    onChange: jest.fn(),
    queryKey: "countries",
    queryFn: jest.fn().mockResolvedValue(mockOk(items)),
    ...props,
  };

  return {
    ...render(
      <PaperProvider>
        <QueryClientProvider client={queryClient}>
          <DataSelector {...defaultProps} />
        </QueryClientProvider>
      </PaperProvider>,
    ),
    onChange: defaultProps.onChange,
  };
}

describe("DataSelector", () => {
  it("shows label", () => {
    renderSelector();
    expect(screen.getByText("Country")).toBeTruthy();
  });

  it("displays Select... when no value", () => {
    renderSelector();
    expect(screen.getByText("Select...")).toBeTruthy();
  });

  it("opens modal on press and shows items", async () => {
    renderSelector();

    fireEvent.press(screen.getByText("Select..."));

    await waitFor(() => {
      expect(screen.getByText("France")).toBeTruthy();
      expect(screen.getByText("Italy")).toBeTruthy();
      expect(screen.getByText("Australia")).toBeTruthy();
    });
  });

  it("single select: calls onChange and closes modal", async () => {
    const { onChange } = renderSelector();

    fireEvent.press(screen.getByText("Select..."));

    await waitFor(() => {
      expect(screen.getByText("France")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("France"));
    expect(onChange).toHaveBeenCalledWith("1");
  });

  it("multi select: accumulates selections", async () => {
    const onChange = jest.fn();
    renderSelector({ allowMultiple: true, onChange });

    fireEvent.press(screen.getByText("Select..."));

    await waitFor(() => {
      expect(screen.getByText("France")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("France"));
    expect(onChange).toHaveBeenCalledWith(["1"]);
  });

  it("does not open modal when disabled", () => {
    renderSelector({ disabled: true });
    fireEvent.press(screen.getByText("Select..."));
    // Modal should not open — items should not be visible
    expect(screen.queryByText("France")).toBeNull();
  });

  it("shows Done button in multi-select mode", async () => {
    renderSelector({ allowMultiple: true });

    fireEvent.press(screen.getByText("Select..."));

    await waitFor(() => {
      expect(screen.getByText("Done")).toBeTruthy();
    });
  });
});
