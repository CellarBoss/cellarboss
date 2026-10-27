import type { ApiResult } from "@cellarboss/common";
import { processBackendError } from "@cellarboss/common";
import { getAuthHeaders } from "@/lib/auth/auth-client";
import { getApiBaseUrl } from "@/lib/api/base-url";

export const UNEXPECTED_RESPONSE_MESSAGE =
  "The server returned an unexpected response. Check that the server URL points at the CellarBoss backend.";

/**
 * Parse a response body as JSON. Anything else (such as an HTML page from the
 * web frontend or a proxy) gets a readable error instead of a parse error.
 */
export function parseResponseBody(text: string): unknown {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(UNEXPECTED_RESPONSE_MESSAGE);
  }
}

export async function makeRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: string,
): Promise<ApiResult<T>> {
  const baseUrl = await getApiBaseUrl();

  if (!baseUrl) {
    return {
      ok: false,
      error: { message: "Server URL not configured", status: 0 },
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(await getAuthHeaders()),
  };

  try {
    const res = await fetch(`${baseUrl}/api/${path}`, {
      method,
      headers,
      body,
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
