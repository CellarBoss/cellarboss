import { describe, it, expect, vi, beforeEach } from "vitest";
import { locationsResource } from "../resources/locations";
import type { RequestFn } from "../types";

describe("locationsResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let locations: ReturnType<typeof locationsResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    locations = locationsResource(mockRequest);
  });

  it("getAll calls GET location", async () => {
    await locations.getAll();
    expect(mockRequest).toHaveBeenCalledWith("location", "GET");
  });

  it("getById calls GET location/{id}", async () => {
    await locations.getById(4);
    expect(mockRequest).toHaveBeenCalledWith("location/4", "GET");
  });

  it("create calls POST location with JSON body", async () => {
    const location = { id: 0, name: "Wine Cellar" };
    await locations.create(location as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "location",
      "POST",
      JSON.stringify(location),
    );
  });

  it("update calls PUT location/{id} with JSON body", async () => {
    const location = { id: 3, name: "Kitchen" };
    await locations.update(location as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "location/3",
      "PUT",
      JSON.stringify(location),
    );
  });

  it("delete calls DELETE location/{id}", async () => {
    await locations.delete(3);
    expect(mockRequest).toHaveBeenCalledWith("location/3", "DELETE");
  });
});
