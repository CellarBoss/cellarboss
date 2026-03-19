import { describe, it, expect, vi, beforeEach } from "vitest";
import { vintagesResource } from "../resources/vintages";
import type { RequestFn } from "../types";

describe("vintagesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let vintages: ReturnType<typeof vintagesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    vintages = vintagesResource(mockRequest);
  });

  it("getAll calls GET vintage", async () => {
    await vintages.getAll();
    expect(mockRequest).toHaveBeenCalledWith("vintage", "GET");
  });

  it("getByWineId calls GET vintage/wine/{id}", async () => {
    await vintages.getByWineId(4);
    expect(mockRequest).toHaveBeenCalledWith("vintage/wine/4", "GET");
  });

  it("getById calls GET vintage/{id}", async () => {
    await vintages.getById(2);
    expect(mockRequest).toHaveBeenCalledWith("vintage/2", "GET");
  });

  it("create coerces numeric fields", async () => {
    const vintage = {
      year: "2020" as any,
      wineId: "3" as any,
      drinkFrom: "2025" as any,
      drinkUntil: "2035" as any,
    };
    await vintages.create(vintage as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.year).toBe(2020);
    expect(body.wineId).toBe(3);
    expect(body.drinkFrom).toBe(2025);
    expect(body.drinkUntil).toBe(2035);
  });

  it("create sets nullable fields to null when falsy", async () => {
    const vintage = {
      year: null,
      wineId: 1,
      drinkFrom: null,
      drinkUntil: null,
    };
    await vintages.create(vintage as any);

    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.year).toBeNull();
    expect(body.wineId).toBe(1);
    expect(body.drinkFrom).toBeNull();
    expect(body.drinkUntil).toBeNull();
  });

  it("update coerces numeric fields and uses correct path", async () => {
    const vintage = {
      id: 7,
      year: "2018" as any,
      wineId: "2" as any,
      drinkFrom: null,
      drinkUntil: "2030" as any,
    };
    await vintages.update(vintage as any);

    expect(mockRequest).toHaveBeenCalledWith(
      "vintage/7",
      "PUT",
      expect.any(String),
    );
    const body = JSON.parse(vi.mocked(mockRequest).mock.calls[0][2]!);
    expect(body.year).toBe(2018);
    expect(body.wineId).toBe(2);
    expect(body.drinkFrom).toBeNull();
    expect(body.drinkUntil).toBe(2030);
  });

  it("delete calls DELETE vintage/{id}", async () => {
    await vintages.delete(7);
    expect(mockRequest).toHaveBeenCalledWith("vintage/7", "DELETE");
  });
});
