"use server";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function makeBackendRequest(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reqHeaders = new Headers(init?.headers);
  reqHeaders.set("cookie", cookie);
  if (!(init?.body instanceof FormData)) {
    reqHeaders.set("Content-Type", "application/json");
  }

  try {
    return fetch(url, {
      ...init,
      headers: reqHeaders,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
