import { describe, it, expect } from "vitest";
import { parseId } from "@utils/id.js";

describe("parseId", () => {
  it("returns number for valid integer string", () => {
    expect(parseId("42")).toBe(42);
  });

  it("returns number for string '1'", () => {
    expect(parseId("1")).toBe(1);
  });

  it("returns number for string '0'", () => {
    expect(parseId("0")).toBe(0);
  });

  it("returns null for undefined", () => {
    expect(parseId(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseId("")).toBeNull();
  });

  it("returns null for non-numeric string", () => {
    expect(parseId("abc")).toBeNull();
  });

  it("returns null for NaN-producing string", () => {
    expect(parseId("not-a-number")).toBeNull();
  });

  it("returns number for decimal string", () => {
    expect(parseId("3.14")).toBe(3.14);
  });

  it("returns number for negative string", () => {
    expect(parseId("-1")).toBe(-1);
  });
});
