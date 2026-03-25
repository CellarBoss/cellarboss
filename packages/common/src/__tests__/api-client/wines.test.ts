import { describe, it, expect, vi, beforeEach } from "vitest";
import { winesResource } from "../../resources/wines";
import type { RequestFn } from "../../types";

describe("winesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let wines: ReturnType<typeof winesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    wines = winesResource(mockRequest);
  });

  it("getAll calls GET wine", async () => {
    await wines.getAll();
    expect(mockRequest).toHaveBeenCalledWith("wine", "GET");
  });

  it("getById calls GET wine/{id}", async () => {
    await wines.getById(42);
    expect(mockRequest).toHaveBeenCalledWith("wine/42", "GET");
  });

  it("create coerces wineMakerId and regionId to numbers", async () => {
    const wine = {
      id: 0,
      name: "Barolo",
      wineMakerId: "5" as any,
      regionId: "3" as any,
      type: "Red",
    };
    await wines.create(wine as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.wineMakerId).toBe(5);
    expect(body.regionId).toBe(3);
  });

  it("create sets regionId to null when falsy", async () => {
    const wine = {
      id: 0,
      name: "Test",
      wineMakerId: 1,
      regionId: null,
    };
    await wines.create(wine as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.regionId).toBeNull();
  });

  it("update coerces wineMakerId and regionId to numbers", async () => {
    const wine = {
      id: 10,
      name: "Barolo",
      wineMakerId: "5" as any,
      regionId: "3" as any,
    };
    await wines.update(wine as any);

    expect(mockRequest).toHaveBeenCalledWith(
      "wine/10",
      "PUT",
      expect.any(String),
    );
    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.wineMakerId).toBe(5);
    expect(body.regionId).toBe(3);
  });

  it("delete calls DELETE wine/{id}", async () => {
    await wines.delete(10);
    expect(mockRequest).toHaveBeenCalledWith("wine/10", "DELETE");
  });
});
