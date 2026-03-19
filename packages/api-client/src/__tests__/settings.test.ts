import { describe, it, expect, vi, beforeEach } from "vitest";
import { settingsResource } from "../resources/settings";
import type { RequestFn } from "../types";

describe("settingsResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let settings: ReturnType<typeof settingsResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    settings = settingsResource(mockRequest);
  });

  it("getAll calls GET settings", async () => {
    await settings.getAll();
    expect(mockRequest).toHaveBeenCalledWith("settings", "GET");
  });

  it("getByKey encodes the key in the path", async () => {
    await settings.getByKey("app.theme");
    expect(mockRequest).toHaveBeenCalledWith("settings/app.theme", "GET");
  });

  it("getByKey encodes special characters", async () => {
    await settings.getByKey("key with spaces");
    expect(mockRequest).toHaveBeenCalledWith(
      "settings/key%20with%20spaces",
      "GET",
    );
  });

  it("update encodes the key and sends value as JSON body", async () => {
    await settings.update("app.theme", "dark");
    expect(mockRequest).toHaveBeenCalledWith(
      "settings/app.theme",
      "PUT",
      JSON.stringify({ value: "dark" }),
    );
  });
});
