import { describe, it, expect, vi, beforeEach } from "vitest";
import { winemakersResource } from "../resources/winemakers";
import type { RequestFn } from "../types";

describe("winemakersResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let winemakers: ReturnType<typeof winemakersResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    winemakers = winemakersResource(mockRequest);
  });

  it("getAll calls GET winemaker", async () => {
    await winemakers.getAll();
    expect(mockRequest).toHaveBeenCalledWith("winemaker", "GET");
  });

  it("getById calls GET winemaker/{id}", async () => {
    await winemakers.getById(6);
    expect(mockRequest).toHaveBeenCalledWith("winemaker/6", "GET");
  });

  it("create calls POST winemaker with JSON body", async () => {
    const winemaker = { id: 0, name: "Giacomo Conterno" };
    await winemakers.create(winemaker as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "winemaker",
      "POST",
      JSON.stringify(winemaker),
    );
  });

  it("update calls PUT winemaker/{id} with JSON body", async () => {
    const winemaker = { id: 4, name: "Bruno Giacosa" };
    await winemakers.update(winemaker as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "winemaker/4",
      "PUT",
      JSON.stringify(winemaker),
    );
  });

  it("delete calls DELETE winemaker/{id}", async () => {
    await winemakers.delete(4);
    expect(mockRequest).toHaveBeenCalledWith("winemaker/4", "DELETE");
  });
});
