import { describe, it, expect, vi, beforeEach } from "vitest";
import { winegrapesResource } from "../resources/winegrapes";
import type { RequestFn } from "../types";

describe("winegrapesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let winegrapes: ReturnType<typeof winegrapesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    winegrapes = winegrapesResource(mockRequest);
  });

  it("getAll calls GET winegrape", async () => {
    await winegrapes.getAll();
    expect(mockRequest).toHaveBeenCalledWith("winegrape", "GET");
  });

  it("getByWineId calls GET winegrape/wine/{id}", async () => {
    await winegrapes.getByWineId(4);
    expect(mockRequest).toHaveBeenCalledWith("winegrape/wine/4", "GET");
  });

  it("create calls POST winegrape with JSON body", async () => {
    const data = { wineId: 1, grapeId: 2, percentage: 100 };
    await winegrapes.create(data as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "winegrape",
      "POST",
      JSON.stringify(data),
    );
  });

  it("delete calls DELETE winegrape/{id}", async () => {
    await winegrapes.delete(3);
    expect(mockRequest).toHaveBeenCalledWith("winegrape/3", "DELETE");
  });
});
