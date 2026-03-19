import { describe, it, expect, vi, beforeEach } from "vitest";
import { grapesResource } from "../resources/grapes";
import type { RequestFn } from "../types";

describe("grapesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let grapes: ReturnType<typeof grapesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    grapes = grapesResource(mockRequest);
  });

  it("getAll calls GET grape", async () => {
    await grapes.getAll();
    expect(mockRequest).toHaveBeenCalledWith("grape", "GET");
  });

  it("getById calls GET grape/{id}", async () => {
    await grapes.getById(3);
    expect(mockRequest).toHaveBeenCalledWith("grape/3", "GET");
  });

  it("create calls POST grape with JSON body", async () => {
    const grape = { id: 0, name: "Nebbiolo" };
    await grapes.create(grape as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "grape",
      "POST",
      JSON.stringify(grape),
    );
  });

  it("update calls PUT grape/{id} with JSON body", async () => {
    const grape = { id: 2, name: "Sangiovese" };
    await grapes.update(grape as any);
    expect(mockRequest).toHaveBeenCalledWith(
      "grape/2",
      "PUT",
      JSON.stringify(grape),
    );
  });

  it("delete calls DELETE grape/{id}", async () => {
    await grapes.delete(2);
    expect(mockRequest).toHaveBeenCalledWith("grape/2", "DELETE");
  });
});
