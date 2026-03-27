import "../helpers/mock-navigation";
import "../helpers/mock-safe-area";
import { screen, fireEvent } from "@testing-library/react-native";
import { mockRouter } from "../helpers/mock-navigation";
import { renderWithProviders } from "../helpers/test-utils";

// Mock auth context
const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    status: "authenticated" as const,
    user: {
      id: "1",
      email: "admin@cellarboss.test",
      name: "Admin User",
      role: "admin",
    },
    signOut: mockSignOut,
  }),
}));

import MoreScreen from "@/app/(app)/(tabs)/more";

describe("MoreScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all navigation menu items", () => {
    renderWithProviders(<MoreScreen />);

    expect(screen.getByText("Cellar")).toBeTruthy();
    expect(screen.getByText("Wines")).toBeTruthy();
    expect(screen.getByText("Tasting Notes")).toBeTruthy();
    expect(screen.getByText("Winemakers")).toBeTruthy();
    expect(screen.getByText("Regions")).toBeTruthy();
    expect(screen.getByText("Countries")).toBeTruthy();
    expect(screen.getByText("Grapes")).toBeTruthy();
    expect(screen.getByText("Storages")).toBeTruthy();
    expect(screen.getByText("Locations")).toBeTruthy();
    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByText("Sign Out")).toBeTruthy();
  });

  it("shows user email in profile item", () => {
    renderWithProviders(<MoreScreen />);
    expect(screen.getByText("admin@cellarboss.test")).toBeTruthy();
  });

  it("navigates to cellar on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-cellar"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/bottles");
  });

  it("navigates to wines on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-wines"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/wines");
  });

  it("navigates to tasting notes on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-tasting-notes"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/tasting-notes");
  });

  it("navigates to winemakers on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-winemakers"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/winemakers");
  });

  it("navigates to regions on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-regions"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/regions");
  });

  it("navigates to countries on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-countries"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/countries");
  });

  it("navigates to grapes on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-grapes"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/grapes");
  });

  it("navigates to storages on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-storages"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/storages");
  });

  it("navigates to locations on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-locations"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/locations");
  });

  it("navigates to profile on tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-profile"));
    expect(mockRouter.push).toHaveBeenCalledWith("/(app)/profile");
  });

  it("calls signOut on sign out tap", () => {
    renderWithProviders(<MoreScreen />);
    fireEvent.press(screen.getByTestId("menu-sign-out"));
    expect(mockSignOut).toHaveBeenCalled();
  });
});
