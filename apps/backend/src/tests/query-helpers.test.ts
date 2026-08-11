import { describe, it, expect } from "vitest";
import { toBool, toISOString, toNumber } from "@utils/query-helpers.js";

describe("toBool", () => {
  it("returns true for boolean true", () => {
    expect(toBool(true)).toBe(true);
  });

  it("returns false for boolean false", () => {
    expect(toBool(false)).toBe(false);
  });

  it("returns true for 1 (SQLite/MySQL representation)", () => {
    expect(toBool(1)).toBe(true);
  });

  it("returns false for 0", () => {
    expect(toBool(0)).toBe(false);
  });

  it("returns false for other numbers", () => {
    expect(toBool(2)).toBe(false);
    expect(toBool(-1)).toBe(false);
  });
});

describe("toISOString", () => {
  it("converts a Date to an ISO string", () => {
    const date = new Date("2024-01-15T10:30:00.000Z");
    expect(toISOString(date)).toBe("2024-01-15T10:30:00.000Z");
  });

  it("returns strings unchanged (SQLite representation)", () => {
    expect(toISOString("2024-01-15T10:30:00.000Z")).toBe(
      "2024-01-15T10:30:00.000Z",
    );
  });
});

describe("toNumber", () => {
  it("converts a numeric string to a number", () => {
    expect(toNumber("42.5")).toBe(42.5);
  });

  it("returns numbers unchanged (SQLite representation)", () => {
    expect(toNumber(42.5)).toBe(42.5);
  });

  it("converts integer strings", () => {
    expect(toNumber("100")).toBe(100);
  });
});
