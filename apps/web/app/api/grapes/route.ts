import { makeBackendRequest } from "@/lib/api/backend";

export async function GET() {

  return makeBackendRequest(
    `${process.env.CELLARBOSS_SERVER}/api/grape`
  );
}

export async function POST(
  request: Request,
) {
  const body = await request.json();

  return makeBackendRequest(
    `${process.env.CELLARBOSS_SERVER}/api/grape`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );

}