// API client
export { createApiClient } from "./client";
export type { ApiClient, ApiClientConfig } from "./client";
export { ApiQueryError } from "./types";
export type { ApiError, ApiResult, RequestFn, UploadFn } from "./types";
export { processBackendError } from "./errors";
export type { AdminUser, UserFormData } from "./resources/users";

// Constants
export { WINE_TYPE_LABELS, BOTTLE_SIZE_LABELS } from "./constants";

// Format functions
export {
  formatPrice,
  formatDate,
  formatDateTime,
  formatWineType,
  formatStatus,
  formatBottleSize,
  formatDrinkingWindow,
  formatDrinkingStatus,
  scoreColor,
  type DrinkingStatus,
} from "./format";

// Settings
export {
  type SettingValueType,
  type ParsedSettingsMap,
  parseValue,
} from "./settings";

// Hooks
export { useApiQuery, type UseApiQueryResult } from "./hooks/use-api-query";
export { createSettingsHooks } from "./hooks/use-settings";
export {
  isVersionMismatch,
  useVersionMismatch,
} from "./hooks/use-version-mismatch";

// Query gate
export {
  queryGateCore,
  type QueryGateOptions,
  type GateSuccess,
  type GateBlocked,
} from "./query-gate";
