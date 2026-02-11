export type ApiError = {
  message: string;
  errors?: Record<string, string>;
  status: number;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export async function makeRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: string
): Promise<ApiResult<T>> {

  const res = await fetch(path, {
    method: method,
    body: body,
  });

  var response = await res.json();

  if (!res.ok) {
    const error = processBackendError(res, response);
    return { ok: false, error };
  }

  return { ok: true, data: response }
}

function processBackendError(
  response: Response,
  data: any
): ApiError {
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