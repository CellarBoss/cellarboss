export type ApiError = {
  message: string;
  errors?: Record<string, string>;
  status: number;
};

export class ApiQueryError extends Error {
  public readonly apiError: ApiError;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "ApiQueryError";
    this.apiError = apiError;
  }
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export type RequestFn = <T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: string,
) => Promise<ApiResult<T>>;
