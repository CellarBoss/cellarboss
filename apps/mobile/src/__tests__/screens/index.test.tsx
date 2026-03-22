import { render, screen } from "@testing-library/react-native";

// Must mock expo-router before importing component
jest.mock("expo-router", () => ({
  Redirect: ({ href }: { href: string }) => {
    const { Text } = require("react-native");
    return <Text testID="redirect">{href}</Text>;
  },
}));

const mockUseAuth = jest.fn();

jest.mock("@/contexts/auth-context", () => ({
  useAuth: () => mockUseAuth(),
}));

import Index from "@/app/index";

describe("Index (root gateway)", () => {
  it("redirects to setup when needs-setup", () => {
    mockUseAuth.mockReturnValue({ status: "needs-setup" });
    render(<Index />);
    expect(screen.getByTestId("redirect")).toHaveTextContent("/(auth)/setup");
  });

  it("redirects to login when unauthenticated", () => {
    mockUseAuth.mockReturnValue({ status: "unauthenticated" });
    render(<Index />);
    expect(screen.getByTestId("redirect")).toHaveTextContent("/(auth)/login");
  });

  it("redirects to app when authenticated", () => {
    mockUseAuth.mockReturnValue({
      status: "authenticated",
      user: { id: "1", email: "a@b.com", name: "Test", role: "admin" },
    });
    render(<Index />);
    expect(screen.getByTestId("redirect")).toHaveTextContent("/(app)");
  });

  it("renders nothing during loading", () => {
    mockUseAuth.mockReturnValue({ status: "loading" });
    const { toJSON } = render(<Index />);
    expect(toJSON()).toBeNull();
  });
});
