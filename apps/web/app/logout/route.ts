import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { webEnv } from "@/lib/env";

export async function POST(request: NextRequest) {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  await fetch(`${webEnv.CELLARBOSS_SERVER}/api/auth/sign-out`, {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
  });

  return NextResponse.redirect(new URL("/login", request.url));
}
