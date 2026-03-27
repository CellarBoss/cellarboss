jest.mock("react-native-worklets", () => ({
  isShareableRef: jest.fn(() => false),
  isSynchronizable: jest.fn(() => false),
  makeShareable: jest.fn((v: unknown) => v),
  makeShareableCloneOnUIRecursive: jest.fn((v: unknown) => v),
  makeShareableCloneRecursive: jest.fn((v: unknown) => v),
  createSerializable: jest.fn((v: unknown) => v),
  createSynchronizable: jest.fn((v: unknown) => v),
  serializableMappingCache: { get: jest.fn(), set: jest.fn() },
  runOnUI: jest.fn(),
  runOnJS: jest.fn((fn: unknown) => fn),
  useSharedValue: jest.fn((v: unknown) => ({ value: v })),
  useWorkletCallback: jest.fn((fn: unknown) => fn),
  getRuntimeKind: jest.fn(),
  createWorkletRuntime: jest.fn(),
  isWorkletFunction: jest.fn(() => false),
  WorkletsModule: {},
}));

jest.mock("react-native-reanimated", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View },
    Extrapolation: { CLAMP: "clamp", EXTEND: "extend", IDENTITY: "identity" },
    useAnimatedStyle: (fn: () => object) => fn(),
    useSharedValue: (v: unknown) => ({ value: v }),
    withTiming: (v: unknown) => v,
    withSpring: (v: unknown) => v,
    interpolate: (
      _value: number,
      _inputRange: number[],
      outputRange: number[],
    ) => outputRange[0],
    runOnJS: (fn: unknown) => fn,
    runOnUI: jest.fn(),
  };
});

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: "success",
    Warning: "warning",
    Error: "error",
  },
  ImpactFeedbackStyle: {
    Light: "light",
    Medium: "medium",
    Heavy: "heavy",
  },
}));
