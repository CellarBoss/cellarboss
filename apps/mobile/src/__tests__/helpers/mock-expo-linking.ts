// expo-linking needs a native manifest to resolve the app scheme, which
// doesn't exist under Jest. The Better Auth Expo client calls createURL for
// every auth request.
jest.mock("expo-linking", () => ({
  createURL: jest.fn(
    (path: string, options?: { scheme?: string }) =>
      `${options?.scheme ?? "cellarboss"}://${path.replace(/^\//, "")}`,
  ),
}));
