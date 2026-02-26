import { describe, it, expect } from "vitest";
import { stringifyValues, expandNamePattern } from "../strings";

describe("stringifyValues", () => {
  it("converts numbers to strings", () => {
    expect(stringifyValues(42)).toBe("42");
  });

  it("converts booleans to strings", () => {
    expect(stringifyValues(true)).toBe("true");
    expect(stringifyValues(false)).toBe("false");
  });

  it("converts null to empty string", () => {
    expect(stringifyValues(null)).toBe("");
  });

  it("converts undefined to empty string", () => {
    expect(stringifyValues(undefined)).toBe("");
  });

  it("leaves strings as strings", () => {
    expect(stringifyValues("hello")).toBe("hello");
  });

  it("converts object values recursively", () => {
    const result = stringifyValues({ a: 1, b: true, c: null });
    expect(result).toEqual({ a: "1", b: "true", c: "" });
  });

  it("converts array values recursively", () => {
    const result = stringifyValues([1, 2, 3]);
    expect(result).toEqual(["1", "2", "3"]);
  });

  it("handles nested objects", () => {
    const result = stringifyValues({ nested: { value: 42 } });
    expect(result).toEqual({ nested: { value: "42" } });
  });
});

describe("expandNamePattern", () => {
  it("returns input unchanged when no pattern present", () => {
    expect(expandNamePattern("Rack A")).toEqual(["Rack A"]);
  });

  it("expands digit ranges", () => {
    expect(expandNamePattern("Row [1-3]")).toEqual(["Row 1", "Row 2", "Row 3"]);
  });

  it("expands uppercase letter ranges", () => {
    expect(expandNamePattern("Shelf [A-C]")).toEqual([
      "Shelf A",
      "Shelf B",
      "Shelf C",
    ]);
  });

  it("expands lowercase letter ranges", () => {
    expect(expandNamePattern("Bin [a-c]")).toEqual(["Bin a", "Bin b", "Bin c"]);
  });

  it("expands multiple ranges", () => {
    const results = expandNamePattern("Row [1-2] Shelf [A-B]");
    expect(results).toEqual([
      "Row 1 Shelf A",
      "Row 1 Shelf B",
      "Row 2 Shelf A",
      "Row 2 Shelf B",
    ]);
  });

  it("treats reverse ranges as literals", () => {
    expect(expandNamePattern("Rack [3-1]")).toEqual(["Rack [3-1]"]);
  });

  it("treats cross-category ranges as literals", () => {
    // Digit-to-letter is not a valid range
    expect(expandNamePattern("Bin [1-A]")).toEqual(["Bin [1-A]"]);
  });

  it("caps expansion at 1000 results", () => {
    // [0-9][0-9][0-9] = 1000 combinations, but capped
    const results = expandNamePattern("[0-9][0-9][0-9]");
    expect(results.length).toBeLessThanOrEqual(1000);
  });
});
