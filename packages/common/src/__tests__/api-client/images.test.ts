import { describe, it, expect, vi, beforeEach } from "vitest";
import { imagesResource } from "../../resources/images";
import type { RequestFn } from "../../types";

describe("imagesResource", () => {
  const mockRequest = vi.fn() as unknown as RequestFn;
  let images: ReturnType<typeof imagesResource>;

  beforeEach(() => {
    vi.mocked(mockRequest).mockReset();
    vi.mocked(mockRequest).mockResolvedValue({ ok: true, data: null });
    images = imagesResource(mockRequest);
  });

  it("getByVintageId calls GET image/vintage/{id}", async () => {
    await images.getByVintageId(5);
    expect(mockRequest).toHaveBeenCalledWith("image/vintage/5", "GET");
  });

  it("delete calls DELETE image/{id}", async () => {
    await images.delete(3);
    expect(mockRequest).toHaveBeenCalledWith("image/3", "DELETE");
  });

  it("setFavourite calls PUT image/{id}/favourite", async () => {
    await images.setFavourite(7);
    expect(mockRequest).toHaveBeenCalledWith("image/7/favourite", "PUT");
  });

  it("unsetFavourite calls DELETE image/{id}/favourite", async () => {
    await images.unsetFavourite(7);
    expect(mockRequest).toHaveBeenCalledWith("image/7/favourite", "DELETE");
  });
});

describe("imagesResource URL helpers", () => {
  const images = imagesResource(vi.fn() as unknown as RequestFn);

  it("getImageUrl returns image/{id}/file", () => {
    expect(images.getImageUrl(4)).toBe("image/4/file");
  });

  it("getThumbUrl returns image/{id}/thumb", () => {
    expect(images.getThumbUrl(4)).toBe("image/4/thumb");
  });
});
