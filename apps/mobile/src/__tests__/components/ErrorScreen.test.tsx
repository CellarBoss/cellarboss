import { render, screen, fireEvent } from "@testing-library/react-native";
import { ErrorScreen } from "@/components/ErrorScreen";

describe("ErrorScreen", () => {
  it("shows the error message", () => {
    render(<ErrorScreen message="Something broke" />);
    expect(screen.getByText("Something broke")).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("renders retry button when onRetry provided", () => {
    const onRetry = jest.fn();
    render(<ErrorScreen message="Error" onRetry={onRetry} />);
    expect(screen.getByText("Try Again")).toBeTruthy();
  });

  it("calls onRetry on press", () => {
    const onRetry = jest.fn();
    render(<ErrorScreen message="Error" onRetry={onRetry} />);
    fireEvent.press(screen.getByText("Try Again"));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry not provided", () => {
    render(<ErrorScreen message="Error" />);
    expect(screen.queryByText("Try Again")).toBeNull();
  });
});
