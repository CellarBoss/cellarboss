import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { webEnv } from "@/lib/env";

async function proxyToBackend(
  req: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const headersList = await headers();
  const cookie = headersList.get("cookie");

  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const backendPath = pathSegments.join("/");
  const backendUrl = `${webEnv.CELLARBOSS_SERVER}/api/image/${backendPath}`;

  const reqHeaders = new Headers();
  reqHeaders.set("cookie", cookie);

  // Forward content-type (including multipart boundary for uploads)
  const contentType = req.headers.get("content-type");
  if (contentType) {
    reqHeaders.set("content-type", contentType);
  }

  const body =
    req.method === "GET" || req.method === "DELETE" ? undefined : req.body;

  const backendRes = await fetch(backendUrl, {
    method: req.method,
    headers: reqHeaders,
    body,
    // @ts-expect-error — Node fetch requires this for streaming bodies
    duplex: "half",
  });

  // For binary responses (image files), stream directly
  const resContentType = backendRes.headers.get("content-type") ?? "";
  if (resContentType.startsWith("image/")) {
    const buffer = await backendRes.arrayBuffer();
    return new NextResponse(buffer, {
      status: backendRes.status,
      headers: { "content-type": resContentType },
    });
  }

  const data = await backendRes.text();
  return new NextResponse(data, {
    status: backendRes.status,
    headers: { "content-type": "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyToBackend(req, path);
}
