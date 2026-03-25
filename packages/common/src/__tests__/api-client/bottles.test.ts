import { describe, it, expect, vi, beforeEach } from "vitest";
import { bottlesResource } from "../../resources/bottles";
import type { RequestFn } from "../../types";

describe("bottlesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let bottles: ReturnType<typeof bottlesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    bottles = bottlesResource(mockRequest);
  });

  it("getAll calls GET bottle", async () => {
    await bottles.getAll();
    expect(mockRequest).toHaveBeenCalledWith("bottle", "GET");
  });

  it("getByVintageId calls GET bottle/vintage/{id}", async () => {
    await bottles.getByVintageId(3);
    expect(mockRequest).toHaveBeenCalledWith("bottle/vintage/3", "GET");
  });

  it("getCountsByVintageId calls correct path", async () => {
    await bottles.getCountsByVintageId(3);
    expect(mockRequest).toHaveBeenCalledWith("bottle/vintage/3/counts", "GET");
  });

  it("getById calls GET bottle/{id}", async () => {
    await bottles.getById(7);
    expect(mockRequest).toHaveBeenCalledWith("bottle/7", "GET");
  });

  it("create picks specific fields and coerces numbers", async () => {
    const bottle = {
      purchaseDate: "2024-01-01",
      purchasePrice: "25.50" as any,
      vintageId: "3" as any,
      storageId: "1" as any,
      status: "In Cellar",
      size: "750ml",
      extraField: "should be excluded",
    };
    await bottles.create(bottle as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.purchasePrice).toBe(25.5);
    expect(body.vintageId).toBe(3);
    expect(body.storageId).toBe(1);
    expect(body.extraField).toBeUndefined();
    expect(body.status).toBe("In Cellar");
    expect(body.size).toBe("750ml");
  });

  it("create sets storageId to null when falsy", async () => {
    const bottle = {
      purchaseDate: "2024-01-01",
      purchasePrice: 10,
      vintageId: 1,
      storageId: null,
      status: "In Cellar",
      size: "750ml",
    };
    await bottles.create(bottle as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.storageId).toBeNull();
  });

  it("update picks specific fields and coerces numbers", async () => {
    const bottle = {
      id: 5,
      purchaseDate: "2024-01-01",
      purchasePrice: "30" as any,
      vintageId: "2" as any,
      storageId: "4" as any,
      status: "Consumed",
      size: "750ml",
    };
    await bottles.update(bottle as any);

    expect(mockRequest).toHaveBeenCalledWith(
      "bottle/5",
      "PUT",
      expect.any(String),
    );
    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.purchasePrice).toBe(30);
    expect(body.vintageId).toBe(2);
    expect(body.storageId).toBe(4);
  });

  it("delete calls DELETE bottle/{id}", async () => {
    await bottles.delete(5);
    expect(mockRequest).toHaveBeenCalledWith("bottle/5", "DELETE");
  });
});
