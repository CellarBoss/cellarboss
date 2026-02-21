import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  const headersList = await headers();
  const cookie = headersList.get("cookie") ?? "";

  await fetch(`${process.env.CELLARBOSS_SERVER}/api/auth/sign-out`, {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
  });

  return NextResponse.redirect(new URL("/login", request.url));
}
