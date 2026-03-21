import { describe, it, expect, vi, beforeEach } from "vitest";
import { regionsResource } from "../../resources/regions";
import type { RequestFn } from "../../types";

describe("regionsResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let regions: ReturnType<typeof regionsResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    regions = regionsResource(mockRequest);
  });

  it("getAll calls GET region", async () => {
    await regions.getAll();
    expect(mockRequest).toHaveBeenCalledWith("region", "GET");
  });

  it("getById calls GET region/{id}", async () => {
    await regions.getById(1);
    expect(mockRequest).toHaveBeenCalledWith("region/1", "GET");
  });

  it("create calls POST region with JSON body", async () => {
    const region = { id: 0, name: "Barolo" };
    await regions.create(region as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "region",
      "POST",
      JSON.stringify(region),
    );
  });

  it("update calls PUT region/{id} with JSON body", async () => {
    const region = { id: 5, name: "Chianti" };
    await regions.update(region as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "region/5",
      "PUT",
      JSON.stringify(region),
    );
  });

  it("delete calls DELETE region/{id}", async () => {
    await regions.delete(5);
    expect(mockRequest).toHaveBeenCalledWith("region/5", "DELETE");
  });
});
