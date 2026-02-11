import { makeBackendRequest } from "@/lib/api/backend";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return makeBackendRequest(
    `${process.env.CELLARBOSS_SERVER}/api/location/${id}`
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return makeBackendRequest(
    `${process.env.CELLARBOSS_SERVER}/api/location/${id}`,
    {
      method: "DELETE",
    }
  );
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;
  const body = await request.json();

  return makeBackendRequest(
    `${process.env.CELLARBOSS_SERVER}/api/location/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );

}
