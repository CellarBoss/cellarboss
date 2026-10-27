import type { ApiResult } from "@cellarboss/common";
import { processBackendError } from "@cellarboss/common";
import { getAuthHeaders } from "@/lib/auth/auth-client";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { parseResponseBody } from "@/lib/api/request";

/**
 * Upload a multipart/form-data request to the backend.
 * Does NOT set Content-Type — fetch sets the multipart boundary automatically.
 */
export async function uploadRequest<T>(
  path: string,
  formData: FormData,
): Promise<ApiResult<T>> {
  const baseUrl = await getApiBaseUrl();

  if (!baseUrl) {
    return {
      ok: false,
      error: { message: "Server URL not configured", status: 0 },
    };
  }

  const headers = await getAuthHeaders();

  try {
    const res = await fetch(`${baseUrl}/api/${path}`, {
      method: "POST",
      headers,
      body: formData,
      // The session cookie is sent explicitly above
      credentials: "omit",
    });

    const text = await res.text();
    const data = parseResponseBody(text);

    if (!res.ok) {
      const error = processBackendError(res, data);
      return { ok: false, error };
    }

    return { ok: true, data: data as T };
  } catch (err: unknown) {
    return {
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Network error",
        status: 0,
      },
    };
  }
}
