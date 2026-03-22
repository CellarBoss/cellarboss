import "../helpers/mock-navigation";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { mockRouter } from "../helpers/mock-navigation";

// Mock auth context
const mockMarkServerConfigured = jest.fn();

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    markServerConfigured: mockMarkServerConfigured,
  }),
}));

// Mock secure store
const mockSetServerUrl = jest.fn().mockResolvedValue(undefined);

jest.mock("@/lib/auth/secure-store", () => ({
  setServerUrl: (...args: unknown[]) => mockSetServerUrl(...args),
}));

// Mock auth service
const mockTestServerConnection = jest.fn();

jest.mock("@/lib/auth/auth-service", () => ({
  testServerConnection: (url: string) => mockTestServerConnection(url),
}));

import SetupScreen from "@/app/(auth)/setup";

describe("SetupScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders URL input and Connect button", () => {
    render(<SetupScreen />);
    expect(screen.getByPlaceholderText("e.g. cellar.example.com")).toBeTruthy();
    expect(screen.getByText("Connect")).toBeTruthy();
  });

  it("shows error on empty URL", async () => {
    render(<SetupScreen />);
    fireEvent.press(screen.getByText("Connect"));

    await waitFor(() => {
      expect(
        screen.getByText("Please enter your CellarBoss server URL"),
      ).toBeTruthy();
    });
  });

  it("auto-prepends https:// and connects", async () => {
    mockTestServerConnection.mockResolvedValue(true);

    render(<SetupScreen />);

    const input = screen.getByPlaceholderText("e.g. cellar.example.com");
    fireEvent.changeText(input, "cellar.example.com");
    fireEvent.press(screen.getByText("Connect"));

    await waitFor(() => {
      expect(mockTestServerConnection).toHaveBeenCalledWith(
        "https://cellar.example.com",
      );
      expect(mockSetServerUrl).toHaveBeenCalledWith(
        "https://cellar.example.com",
      );
      expect(mockMarkServerConfigured).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/login");
    });
  });

  it("shows error when server connection fails", async () => {
    mockTestServerConnection.mockResolvedValue(false);

    render(<SetupScreen />);

    const input = screen.getByPlaceholderText("e.g. cellar.example.com");
    fireEvent.changeText(input, "bad.server.com");
    fireEvent.press(screen.getByText("Connect"));

    await waitFor(() => {
      expect(screen.getByText(/Could not connect to this server/)).toBeTruthy();
    });
  });

  it("strips trailing slashes", async () => {
    mockTestServerConnection.mockResolvedValue(true);

    render(<SetupScreen />);

    const input = screen.getByPlaceholderText("e.g. cellar.example.com");
    fireEvent.changeText(input, "https://cellar.example.com///");
    fireEvent.press(screen.getByText("Connect"));

    await waitFor(() => {
      expect(mockTestServerConnection).toHaveBeenCalledWith(
        "https://cellar.example.com",
      );
    });
  });
});
