import type { ApiResult, ApiError } from "@cellarboss/common";

export function mockOk<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function mockError(
  message: string,
  status = 400,
  errors?: Record<string, string>,
): ApiResult<never> {
  const error: ApiError = { message, status };
  if (errors) error.errors = errors;
  return { ok: false, error };
}
