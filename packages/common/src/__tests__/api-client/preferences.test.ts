import { describe, it, expect, vi, beforeEach } from "vitest";
import { preferencesResource } from "../../resources/preferences";
import type { RequestFn } from "../../types";

describe("preferencesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let preferences: ReturnType<typeof preferencesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({
      ok: true,
      data: { success: true },
    });
    preferences = preferencesResource(mockRequest);
  });

  it("get encodes the key in the path", async () => {
    await preferences.get("datatable.wines.columnVisibility");
    expect(mockRequest).toHaveBeenCalledWith(
      "preferences/datatable.wines.columnVisibility",
      "GET",
    );
  });

  it("get encodes special characters", async () => {
    await preferences.get("datatable:wines columns");
    expect(mockRequest).toHaveBeenCalledWith(
      "preferences/datatable%3Awines%20columns",
      "GET",
    );
  });

  it("update sends the JSON preference value", async () => {
    const value = { name: true, region: false };
    await preferences.update("datatable.wines.columnVisibility", value);
    expect(mockRequest).toHaveBeenCalledWith(
      "preferences/datatable.wines.columnVisibility",
      "PUT",
      JSON.stringify({ value }),
    );
  });

  it("delete returns success as a boolean", async () => {
    const result = await preferences.delete("datatable.wines.columnVisibility");
    expect(mockRequest).toHaveBeenCalledWith(
      "preferences/datatable.wines.columnVisibility",
      "DELETE",
    );
    expect(result).toEqual({ ok: true, data: true });
  });
});
