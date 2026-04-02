import type { ApiResult } from "@cellarboss/common";
import { processBackendError } from "@cellarboss/common";
import { getToken } from "@/lib/auth/secure-store";
import { getApiBaseUrl } from "@/lib/api/base-url";

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

  const token = await getToken();

  const headers: Record<string, string> = {
    Origin: baseUrl,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${baseUrl}/api/${path}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const error = processBackendError(res, data);
      return { ok: false, error };
    }

    return { ok: true, data };
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
