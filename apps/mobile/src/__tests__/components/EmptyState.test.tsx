import { render, screen, fireEvent } from "@testing-library/react-native";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("shows title", () => {
    render(<EmptyState title="No wines found" />);
    expect(screen.getByText("No wines found")).toBeTruthy();
  });

  it("shows message when provided", () => {
    render(<EmptyState title="Empty" message="Try adding some wines" />);
    expect(screen.getByText("Try adding some wines")).toBeTruthy();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    const onAction = jest.fn();
    render(
      <EmptyState title="Empty" actionLabel="Add Wine" onAction={onAction} />,
    );
    expect(screen.getByText("Add Wine")).toBeTruthy();
  });

  it("calls onAction on button press", () => {
    const onAction = jest.fn();
    render(
      <EmptyState title="Empty" actionLabel="Add Wine" onAction={onAction} />,
    );
    fireEvent.press(screen.getByText("Add Wine"));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render action button without both actionLabel and onAction", () => {
    render(<EmptyState title="Empty" actionLabel="Add Wine" />);
    expect(screen.queryByText("Add Wine")).toBeNull();
  });
});
