import { render, screen, fireEvent } from "@testing-library/react-native";
import * as Haptics from "expo-haptics";
import { WineGlassRating } from "@/components/WineGlassRating";

describe("WineGlassRating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays the rating text", () => {
    render(<WineGlassRating value={7} />);
    expect(screen.getByText("7/10")).toBeTruthy();
  });

  it("renders 10 glass buttons", () => {
    render(<WineGlassRating value={3} />);
    const glasses = screen.getAllByText("🍷");
    expect(glasses).toHaveLength(10);
  });

  it("calls onChange with new value when editable glass pressed", () => {
    const onChange = jest.fn();
    render(<WineGlassRating value={3} onChange={onChange} editable />);

    const glasses = screen.getAllByText("🍷");
    // Press the 5th glass (index 4) → value should be 5
    fireEvent.press(glasses[4]);
    expect(onChange).toHaveBeenCalledWith(5);
    expect(Haptics.selectionAsync).toHaveBeenCalled();
  });

  it("toggles off when pressing the current value glass", () => {
    const onChange = jest.fn();
    render(<WineGlassRating value={3} onChange={onChange} editable />);

    const glasses = screen.getAllByText("🍷");
    // Press the 3rd glass (index 2, value 3) → should toggle to 0
    fireEvent.press(glasses[2]);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("does not call onChange in read-only mode", () => {
    const onChange = jest.fn();
    render(<WineGlassRating value={5} onChange={onChange} />);

    const glasses = screen.getAllByText("🍷");
    fireEvent.press(glasses[0]);
    expect(onChange).not.toHaveBeenCalled();
  });
});
