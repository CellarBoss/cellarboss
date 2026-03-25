import "../helpers/mock-navigation";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { PaperProvider } from "react-native-paper";
import { ScreenHeader } from "@/components/ScreenHeader";
import { mockRouter } from "../helpers/mock-navigation";

function renderHeader(
  props: Partial<React.ComponentProps<typeof ScreenHeader>> = {},
) {
  return render(
    <PaperProvider>
      <ScreenHeader title="My Screen" {...props} />
    </PaperProvider>,
  );
}

describe("ScreenHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title", () => {
    renderHeader();
    expect(screen.getByText("My Screen")).toBeTruthy();
  });

  it("back button calls router.back()", () => {
    renderHeader({ showBack: true });
    // The back button is an IconButton with icon "arrow-left"
    const buttons = screen.getAllByRole("button");
    fireEvent.press(buttons[0]);
    expect(mockRouter.back).toHaveBeenCalledTimes(1);
  });

  it("does not show back button by default", () => {
    renderHeader();
    // Only action buttons (if any), no back button
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
