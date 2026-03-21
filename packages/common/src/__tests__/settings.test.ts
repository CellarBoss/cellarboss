import { describe, it, expect } from "vitest";
import { parseValue } from "../settings";

describe("parseValue", () => {
  it("converts 'true' to boolean true", () => {
    expect(parseValue("true")).toBe(true);
  });

  it("converts 'false' to boolean false", () => {
    expect(parseValue("false")).toBe(false);
  });

  it("converts 'null' to null", () => {
    expect(parseValue("null")).toBeNull();
  });

  it("converts empty string to null", () => {
    expect(parseValue("")).toBeNull();
  });

  it("converts numeric strings to numbers", () => {
    expect(parseValue("42")).toBe(42);
    expect(parseValue("3.14")).toBe(3.14);
    expect(parseValue("0")).toBe(0);
    expect(parseValue("-10")).toBe(-10);
  });

  it("returns plain strings as-is", () => {
    expect(parseValue("hello")).toBe("hello");
    expect(parseValue("some setting")).toBe("some setting");
  });

  it("does not convert strings that look partially numeric", () => {
    expect(parseValue("12px")).toBe("12px");
    expect(parseValue("3.14.15")).toBe("3.14.15");
  });
});
