jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");

  const mockInsets = { top: 0, right: 0, bottom: 0, left: 0 };
  const mockFrame = { x: 0, y: 0, width: 390, height: 844 };

  const mockSafeAreaInsetsContext = React.createContext(mockInsets);
  const mockSafeAreaFrameContext = React.createContext(mockFrame);

  return {
    SafeAreaView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    SafeAreaProvider: ({ children }: any) => (
      <mockSafeAreaFrameContext.Provider value={mockFrame}>
        <mockSafeAreaInsetsContext.Provider value={mockInsets}>
          {children}
        </mockSafeAreaInsetsContext.Provider>
      </mockSafeAreaFrameContext.Provider>
    ),
    SafeAreaInsetsContext: mockSafeAreaInsetsContext,
    SafeAreaFrameContext: mockSafeAreaFrameContext,
    useSafeAreaInsets: () => mockInsets,
    useSafeAreaFrame: () => mockFrame,
    initialWindowMetrics: { insets: mockInsets, frame: mockFrame },
  };
});
