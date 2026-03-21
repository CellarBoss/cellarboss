import { describe, it, expect, vi, beforeEach } from "vitest";
import { storagesResource } from "../../resources/storages";
import type { RequestFn } from "../../types";

describe("storagesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let storages: ReturnType<typeof storagesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    storages = storagesResource(mockRequest);
  });

  it("getAll calls GET storage", async () => {
    await storages.getAll();
    expect(mockRequest).toHaveBeenCalledWith("storage", "GET");
  });

  it("getById calls GET storage/{id}", async () => {
    await storages.getById(2);
    expect(mockRequest).toHaveBeenCalledWith("storage/2", "GET");
  });

  it("create coerces locationId and parent to numbers", async () => {
    const storage = {
      id: 0,
      name: "Rack A",
      locationId: "3" as any,
      parent: "1" as any,
    };
    await storages.create(storage as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.locationId).toBe(3);
    expect(body.parent).toBe(1);
  });

  it("create sets nullable fields to null when falsy", async () => {
    const storage = {
      id: 0,
      name: "Rack B",
      locationId: null,
      parent: null,
    };
    await storages.create(storage as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.locationId).toBeNull();
    expect(body.parent).toBeNull();
  });

  it("update coerces locationId and parent to numbers", async () => {
    const storage = {
      id: 5,
      name: "Rack A",
      locationId: "3" as any,
      parent: "1" as any,
    };
    await storages.update(storage as any);

    expect(mockRequest).toHaveBeenCalledWith(
      "storage/5",
      "PUT",
      expect.any(String),
    );
    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.locationId).toBe(3);
    expect(body.parent).toBe(1);
  });

  it("delete calls DELETE storage/{id}", async () => {
    await storages.delete(5);
    expect(mockRequest).toHaveBeenCalledWith("storage/5", "DELETE");
  });
});
