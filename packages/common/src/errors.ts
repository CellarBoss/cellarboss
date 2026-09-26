import type { ApiError } from "./types";

type BackendErrorBody = {
  errors?: { path?: string; msg: string }[];
  error?: string;
  message?: string;
};

export function processBackendError(
  response: Response,
  data: unknown,
): ApiError {
  const body: BackendErrorBody =
    typeof data === "object" && data !== null ? data : {};

  if (body.errors?.length) {
    const fieldErrors: Record<string, string> = {};

    for (const err of body.errors) {
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
    message: body.error ?? body.message ?? "Unexpected error",
    status: response.status,
  };
}
