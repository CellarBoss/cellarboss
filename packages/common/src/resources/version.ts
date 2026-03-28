import type { ApiResult, RequestFn } from "../types";

export type ServerVersion = {
  version: string;
};

export function versionResource(request: RequestFn) {
  return {
    get: (): Promise<ApiResult<ServerVersion>> =>
      request<ServerVersion>("version", "GET"),
  };
}
