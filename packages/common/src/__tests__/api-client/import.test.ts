import { describe, it, expect, vi, beforeEach } from "vitest";
import { importResource } from "../../resources/import";
import type { RequestFn } from "../../types";

describe("importResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let imports: ReturnType<typeof importResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    imports = importResource(mockRequest);
  });

  it("sites calls GET import/sites", async () => {
    await imports.sites();
    expect(mockRequest).toHaveBeenCalledWith("import/sites", "GET");
  });

  it("preview sends the URL", async () => {
    await imports.preview("https://example.com/wine");
    expect(mockRequest).toHaveBeenCalledWith(
      "import/preview",
      "POST",
      JSON.stringify({ url: "https://example.com/wine" }),
    );
  });

  it("preview sends supplied HTML", async () => {
    await imports.preview("https://example.com/wine", "<html></html>");
    expect(mockRequest).toHaveBeenCalledWith(
      "import/preview",
      "POST",
      JSON.stringify({
        url: "https://example.com/wine",
        html: "<html></html>",
      }),
    );
  });

  it("commit sends the reviewed import", async () => {
    const data = {
      wine: { id: 1 },
      vintage: { year: 2015, drinkFrom: null, drinkUntil: null },
    };
    await imports.commit(data);
    expect(mockRequest).toHaveBeenCalledWith(
      "import/commit",
      "POST",
      JSON.stringify(data),
    );
  });
});
