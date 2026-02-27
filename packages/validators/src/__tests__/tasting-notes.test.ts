import { describe, it, expect } from "vitest";
import {
  createTastingNoteSchema,
  updateTastingNoteSchema,
} from "../tasting-notes.validator";

describe("createTastingNoteSchema", () => {
  it("accepts a valid tasting note", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 1,
      score: 8,
      notes: "Excellent bouquet with a smooth, lingering finish.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a score of 0", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 1,
      score: 0,
      notes: "Undrinkable.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a score of 10", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 1,
      score: 10,
      notes: "Perfect.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a decimal score", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 1,
      score: 7.3,
      notes: "Very good.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty notes string", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 1,
      score: 5,
      notes: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects score above 10", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 1,
      score: 10.1,
      notes: "Too high.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects score below 0", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 1,
      score: -0.1,
      notes: "Negative score.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-positive vintageId", () => {
    const result = createTastingNoteSchema.safeParse({
      vintageId: 0,
      score: 8,
      notes: "Good wine.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing vintageId", () => {
    const result = createTastingNoteSchema.safeParse({
      score: 8,
      notes: "Good wine.",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTastingNoteSchema", () => {
  it("accepts updating score only", () => {
    const result = updateTastingNoteSchema.safeParse({ score: 9 });
    expect(result.success).toBe(true);
  });

  it("accepts updating notes only", () => {
    const result = updateTastingNoteSchema.safeParse({ notes: "Updated notes." });
    expect(result.success).toBe(true);
  });

  it("accepts updating both score and notes", () => {
    const result = updateTastingNoteSchema.safeParse({
      score: 7,
      notes: "Revised after second tasting.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects decimal score on update", () => {
    const result = updateTastingNoteSchema.safeParse({ score: 7.5 });
    expect(result.success).toBe(false);
  });

  it("rejects an empty object", () => {
    const result = updateTastingNoteSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "At least one field must be provided",
      );
    }
  });

  it("rejects score above 10 on update", () => {
    const result = updateTastingNoteSchema.safeParse({ score: 11 });
    expect(result.success).toBe(false);
  });
});
