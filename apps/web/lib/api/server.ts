"use server";

import { headers } from "next/headers";
import { webEnv } from "../env";
import type { ApiResult } from "./types";
import { processBackendError } from "@cellarboss/common";

function sanitizeApiPath(rawPath: string): string {
  const path = rawPath.trim();

  // Disallow full URLs or protocol-like strings.
  if (path.includes("://")) {
    throw new Error("Invalid API path");
  }

  // Disallow path traversal segments.
  if (path.split("/").includes("..")) {
    throw new Error("Invalid API path");
  }

  // Ensure path is relative under `/api/` by stripping leading slashes.
  return path.replace(/^\/+/, "");
}

export async function makeServerRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: string,
): Promise<ApiResult<T>> {
  const safePath = sanitizeApiPath(path);

  const headersList = await headers();
  const cookie = headersList.get("cookie");
  const origin = headersList.get("origin");

  if (!cookie) {
    return { ok: false, error: { message: "Unauthorized", status: 401 } };
  }

  const reqHeaders = new Headers();
  reqHeaders.set("cookie", cookie);
  reqHeaders.set("Content-Type", "application/json");
  if (origin) {
    reqHeaders.set("origin", origin);
  }

  try {
    const res = await fetch(`${webEnv.CELLARBOSS_SERVER}/api/${safePath}`, {
      method,
      headers: reqHeaders,
      body,
    });

    const text = await res.text();

    if (!res.ok) {
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        // Non-JSON error body (e.g. Hono's default "404 Not Found")
      }
      const error = processBackendError(res, data);
      return { ok: false, error };
    }

    const data = text ? JSON.parse(text) : null;
    return { ok: true, data };
  } catch (err: unknown) {
    console.error(err);
    return {
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Internal server error",
        status: 500,
      },
    };
  }
}
