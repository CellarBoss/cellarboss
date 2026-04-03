import { describe, it, expect } from "vitest";
import { imageResponseSchema } from "../images.validator";

describe("imageResponseSchema", () => {
  const valid = {
    id: 1,
    vintageId: 2,
    filename: "abc123.jpg",
    size: 204800,
    isFavourite: true,
    createdBy: "user-1",
    createdAt: "2024-06-15T10:00:00.000Z",
  };

  it("accepts a valid image response", () => {
    const result = imageResponseSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts isFavourite: false", () => {
    const result = imageResponseSchema.safeParse({
      ...valid,
      isFavourite: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects when id is not a number", () => {
    const result = imageResponseSchema.safeParse({ ...valid, id: "1" });
    expect(result.success).toBe(false);
  });

  it("rejects when vintageId is missing", () => {
    const { vintageId: _, ...rest } = valid;
    const result = imageResponseSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects when filename is missing", () => {
    const { filename: _, ...rest } = valid;
    const result = imageResponseSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects when isFavourite is not a boolean", () => {
    const result = imageResponseSchema.safeParse({ ...valid, isFavourite: 1 });
    expect(result.success).toBe(false);
  });

  it("rejects when size is not a number", () => {
    const result = imageResponseSchema.safeParse({ ...valid, size: "204800" });
    expect(result.success).toBe(false);
  });

  it("rejects when createdAt is missing", () => {
    const { createdAt: _, ...rest } = valid;
    const result = imageResponseSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});
