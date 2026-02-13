import { makeBackendRequest } from "@/lib/api/backend";

export async function GET() {
  return makeBackendRequest(
    `${process.env.CELLARBOSS_SERVER}/api/winegrape`
  );
}

export async function POST(
  request: Request,
) {
  const body = await request.json();

  return makeBackendRequest(
    `${process.env.CELLARBOSS_SERVER}/api/winegrape`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
}
