import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { webEnv } from "@/lib/env";

/*
  This route acts as a proxy to the backend auth endpoints, as the backend may not be exposed publically
  but better-auth requires the frontend to make requests to the same origin.
  This way, we can keep the backend auth endpoints private while still allowing the frontend to use better-auth.
*/
async function handler(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname.replace("/api/auth", "");
    const headersList = await headers();
    const cookie = headersList.get("cookie") ?? "";

    const backendUrl = `${webEnv.CELLARBOSS_SERVER}/api/auth${pathname}${request.nextUrl.search}`;

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

    // Copy response headers (especially Set-Cookie)
    const responseHeaders = new Headers(res.headers);

    return new NextResponse(responseText, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
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
