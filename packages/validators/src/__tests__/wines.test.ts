import { describe, it, expect } from "vitest";
import { createWineSchema, updateWineSchema } from "../wines.validator";

describe("createWineSchema", () => {
  it("accepts a valid wine", () => {
    const result = createWineSchema.safeParse({
      name: "Château Margaux",
      wineMakerId: 1,
      regionId: 2,
      type: "red",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null regionId", () => {
    const result = createWineSchema.safeParse({
      name: "Some Wine",
      wineMakerId: 1,
      regionId: null,
      type: "white",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all wine types", () => {
    const types = [
      "red",
      "white",
      "rose",
      "orange",
      "sparkling",
      "fortified",
      "dessert",
    ] as const;
    for (const type of types) {
      const result = createWineSchema.safeParse({
        name: "Test Wine",
        wineMakerId: 1,
        regionId: null,
        type,
      });
      expect(result.success, `type "${type}" should be valid`).toBe(true);
    }
  });

  it("rejects empty name", () => {
    const result = createWineSchema.safeParse({
      name: "",
      wineMakerId: 1,
      regionId: null,
      type: "red",
    });
    expect(result.success).toBe(false);
  });

  it("rejects name exceeding 255 characters", () => {
    const result = createWineSchema.safeParse({
      name: "A".repeat(256),
      wineMakerId: 1,
      regionId: null,
      type: "red",
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = createWineSchema.safeParse({
      name: "  Trimmed Name  ",
      wineMakerId: 1,
      regionId: null,
      type: "red",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Trimmed Name");
    }
  });

  it("rejects invalid wine type", () => {
    const result = createWineSchema.safeParse({
      name: "Test",
      wineMakerId: 1,
      regionId: null,
      type: "pink",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive wineMakerId", () => {
    const result = createWineSchema.safeParse({
      name: "Test",
      wineMakerId: 0,
      regionId: null,
      type: "red",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createWineSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateWineSchema", () => {
  it("accepts a partial update with just name", () => {
    const result = updateWineSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts a partial update with just type", () => {
    const result = updateWineSchema.safeParse({ type: "white" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = updateWineSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "At least one field must be provided",
      );
    }
  });
});
