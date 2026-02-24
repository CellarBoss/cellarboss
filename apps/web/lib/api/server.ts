"use server";

import { headers } from "next/headers";
import { webEnv } from "../env";
import type { ApiResult, ApiError } from "./types";

export async function makeServerRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: string,
): Promise<ApiResult<T>> {
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
    const res = await fetch(`${webEnv.CELLARBOSS_SERVER}/api/${path}`, {
      method,
      headers: reqHeaders,
      body,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const error = processBackendError(res, data);
      return { ok: false, error };
    }

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

function processBackendError(response: Response, data: any): ApiError {
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
