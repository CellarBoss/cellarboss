import { describe, it, expect, vi, beforeEach } from "vitest";
import { preferencesResource } from "../../resources/preferences";
import type { RequestFn } from "../../types";

describe("preferencesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let preferences: ReturnType<typeof preferencesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    preferences = preferencesResource(mockRequest);
  });

  it("getAll calls GET user/preferences", async () => {
    await preferences.getAll();
    expect(mockRequest).toHaveBeenCalledWith("user/preferences", "GET");
  });

  it("getByKey encodes the key in the path", async () => {
    await preferences.getByKey("columns.bottles");
    expect(mockRequest).toHaveBeenCalledWith(
      "user/preferences/columns.bottles",
      "GET",
    );
  });

  it("upsert sends PUT with value as JSON body", async () => {
    await preferences.upsert("columns.bottles", '{"name":true}');
    expect(mockRequest).toHaveBeenCalledWith(
      "user/preferences/columns.bottles",
      "PUT",
      JSON.stringify({ value: '{"name":true}' }),
    );
  });

  it("remove sends DELETE for the key", async () => {
    await preferences.remove("columns.bottles");
    expect(mockRequest).toHaveBeenCalledWith(
      "user/preferences/columns.bottles",
      "DELETE",
    );
  });
});
