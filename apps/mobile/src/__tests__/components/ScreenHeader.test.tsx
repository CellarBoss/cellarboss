import "../helpers/mock-navigation";
import { screen, fireEvent } from "@testing-library/react-native";
import { ScreenHeader } from "@/components/ScreenHeader";
import { mockRouter } from "../helpers/mock-navigation";
import { renderWithProviders } from "../helpers/test-utils";

function renderHeader(
  props: Partial<React.ComponentProps<typeof ScreenHeader>> = {},
) {
  return renderWithProviders(<ScreenHeader title="My Screen" {...props} />);
}

describe("ScreenHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    renderHeader();
    expect(screen.getByText("My Screen")).toBeTruthy();
  });

  it("back button navigates back", () => {
    renderHeader({ showBack: true });
    const buttons = screen.getAllByRole("button");
    fireEvent.press(buttons[0]);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("does not show back button by default", () => {
    renderHeader();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("renders action icons", () => {
    const onPress = jest.fn();
    renderHeader({
      actions: [
        { icon: "pencil", onPress },
        { icon: "delete", onPress: jest.fn() },
      ],
    });
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
    fireEvent.press(buttons[0]);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
