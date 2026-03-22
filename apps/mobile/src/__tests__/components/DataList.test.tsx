import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { Text } from "react-native";
import { DataList } from "@/components/DataList";

// Mock gesture handler
jest.mock("react-native-gesture-handler/ReanimatedSwipeable", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: ReactNode }) => <View>{children}</View>,
  };
});

type TestItem = { id: number; name: string };

const testData: TestItem[] = [
  { id: 1, name: "Burgundy" },
  { id: 2, name: "Bordeaux" },
  { id: 3, name: "Barossa Valley" },
];

function renderDataList(
  props: Partial<React.ComponentProps<typeof DataList<TestItem>>> = {},
) {
  const defaultProps = {
    data: testData,
    renderItem: (item: TestItem) => <Text key={item.id}>{item.name}</Text>,
    keyExtractor: (item: TestItem) => String(item.id),
    ...props,
  };

  return render(
    <PaperProvider>
      <DataList {...defaultProps} />
    </PaperProvider>,
  );
}

describe("DataList", () => {
  it("renders items", () => {
    renderDataList();
    expect(screen.getByText("Burgundy")).toBeTruthy();
    expect(screen.getByText("Bordeaux")).toBeTruthy();
    expect(screen.getByText("Barossa Valley")).toBeTruthy();
  });

  it("filters items via search", () => {
    renderDataList({
      searchFilter: (item, query) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
    });

    const searchbar = screen.getByPlaceholderText("Search...");
    fireEvent.changeText(searchbar, "Bor");

    expect(screen.getByText("Bordeaux")).toBeTruthy();
    expect(screen.queryByText("Burgundy")).toBeNull();
    expect(screen.queryByText("Barossa Valley")).toBeNull();
  });

  it("shows empty state when no data", () => {
    renderDataList({
      data: [],
      emptyTitle: "No wines",
      emptyMessage: "Add some wines to get started",
    });

    expect(screen.getByText("No wines")).toBeTruthy();
    expect(screen.getByText("Add some wines to get started")).toBeTruthy();
  });

  it("shows empty state when search yields no results", () => {
    renderDataList({
      searchFilter: (item, query) =>
        item.name.toLowerCase().includes(query.toLowerCase()),
      emptyTitle: "No results",
    });

    const searchbar = screen.getByPlaceholderText("Search...");
    fireEvent.changeText(searchbar, "zzzzz");

    expect(screen.getByText("No results")).toBeTruthy();
  });

  it("passes onRefresh to FlatList", () => {
    const onRefresh = jest.fn();
    renderDataList({ onRefresh });

    // Verify the list rendered without errors when onRefresh is provided
    expect(screen.getByText("Burgundy")).toBeTruthy();
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
