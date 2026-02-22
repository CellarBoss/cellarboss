import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { webEnv } from "@/lib/env";

async function handler(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname.replace("/api/auth", "");
    const headersList = await headers();
    const cookie = headersList.get("cookie") ?? "";

    const backendUrl = `${webEnv.CELLARBOSS_SERVER}/api/auth${pathname}${request.nextUrl.search}`;
    console.log(`[Auth Proxy] ${request.method} ${backendUrl}`);

    let body: string | undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.text();
    }

    const res = await fetch(backendUrl, {
      method: request.method,
      headers: {
        ...(cookie && { cookie }),
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          authorization: request.headers.get("authorization")!,
        }),
        ...(request.headers.get("origin") && {
          origin: request.headers.get("origin")!,
        }),
      },
      body,
    });

    const responseText = await res.text();
    console.log(`[Auth Proxy] Response status: ${res.status}`);

    // Copy response headers (especially Set-Cookie)
    const responseHeaders = new Headers(res.headers);

    return new NextResponse(responseText, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Auth Proxy] Error:", error);
    return NextResponse.json(
      { error: "Auth proxy error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export const POST = handler;
export const GET = handler;
export const PUT = handler;
export const DELETE = handler;
