"use server";

import { headers } from "next/headers";
import type { ApiResult, ApiError } from "./types";

export async function makeServerRequest<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: string,
): Promise<ApiResult<T>> {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  if (!cookie) {
    return { ok: false, error: { message: "Unauthorized", status: 401 } };
  }

  const reqHeaders = new Headers();
  reqHeaders.set("cookie", cookie);
  reqHeaders.set("Content-Type", "application/json");

  try {
    const res = await fetch(`${process.env.CELLARBOSS_SERVER}/api/${path}`, {
      method,
      headers: reqHeaders,
      body,
    });

    const data = await res.json();

    if (!res.ok) {
      const error = processBackendError(res, data);
      return { ok: false, error };
    }

    return { ok: true, data };
  } catch (err: any) {
    console.error(err);
    return {
      ok: false,
      error: { message: err.message || "Internal server error", status: 500 },
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
