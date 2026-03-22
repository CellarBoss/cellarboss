import { render, screen } from "@testing-library/react-native";
import { LoadingScreen } from "@/components/LoadingScreen";

describe("LoadingScreen", () => {
  it("renders an ActivityIndicator", () => {
    render(<LoadingScreen />);
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("shows message when provided", () => {
    render(<LoadingScreen message="Loading wines..." />);
    expect(screen.getByText("Loading wines...")).toBeTruthy();
  });

  it("does not show message when not provided", () => {
    render(<LoadingScreen />);
    expect(screen.queryByText(/./)).toBeNull();
  });
});
