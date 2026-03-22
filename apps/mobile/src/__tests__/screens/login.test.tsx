import "../helpers/mock-navigation";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import { mockRouter } from "../helpers/mock-navigation";

// Mock auth context
const mockSignIn = jest.fn();
const mockResetServer = jest.fn();

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    resetServer: mockResetServer,
  }),
}));

// Mock secure store
jest.mock("@/lib/auth/secure-store", () => ({
  getSavedEmail: jest.fn().mockResolvedValue("admin@test.com"),
  getServerUrl: jest.fn().mockResolvedValue("https://cellar.example.com"),
}));

import LoginScreen from "@/app/(auth)/login";

describe("LoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockReset();
    mockResetServer.mockResolvedValue(undefined);
  });

  it("renders email and password inputs", () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
  });

  it("pre-fills saved email", async () => {
    render(<LoginScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("admin@test.com")).toBeTruthy();
    });
  });

  it("shows error on empty fields", async () => {
    render(<LoginScreen />);

    // Clear pre-filled email
    const emailInput = screen.getByPlaceholderText("you@example.com");
    fireEvent.changeText(emailInput, "");

    // "Sign In" appears as both title and button; press the last one (button)
    const signInElements = screen.getAllByText("Sign In");
    fireEvent.press(signInElements[signInElements.length - 1]);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter your email and password"),
      ).toBeTruthy();
    });
  });

  it("calls signIn and navigates on success", async () => {
    mockSignIn.mockResolvedValue({ ok: true });

    render(<LoginScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("admin@test.com")).toBeTruthy();
    });

    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "password123");

    // "Sign In" appears as both title and button; press the last one (button)
    const signInElements = screen.getAllByText("Sign In");
    fireEvent.press(signInElements[signInElements.length - 1]);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("admin@test.com", "password123");
      expect(mockRouter.replace).toHaveBeenCalledWith("/(app)");
    });
  });

  it("shows error message on sign-in failure", async () => {
    mockSignIn.mockResolvedValue({ ok: false, error: "Invalid credentials" });

    render(<LoginScreen />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("admin@test.com")).toBeTruthy();
    });

    const passwordInput = screen.getByPlaceholderText("Password");
    fireEvent.changeText(passwordInput, "wrong");

    // "Sign In" appears as both title and button; press the last one (button)
    const signInElements = screen.getAllByText("Sign In");
    fireEvent.press(signInElements[signInElements.length - 1]);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeTruthy();
    });
  });

  it("Change server calls resetServer and navigates to setup", async () => {
    render(<LoginScreen />);

    fireEvent.press(screen.getByText("Change server"));

    await waitFor(() => {
      expect(mockResetServer).toHaveBeenCalled();
      expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/setup");
    });
  });
});
