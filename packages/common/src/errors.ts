import type { ApiError } from "./types";

export function processBackendError(response: Response, data: any): ApiError {
  if (data?.errors?.length) {
    const fieldErrors: Record<string, string> = {};

    for (const err of data.errors) {
      if (err.path) {
        fieldErrors[err.path] = err.msg;
      }
    }

    return {
      message: "Input validation failed",
      errors: fieldErrors,
      status: response.status,
    };
  }

  return {
    message: data?.error ?? data?.message ?? "Unexpected error",
    status: response.status,
  };
}
