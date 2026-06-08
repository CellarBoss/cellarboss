import { describe, it, expect } from "vitest";
import { parsePreference } from "../preferences";

describe("parsePreference", () => {
  it("parses a JSON object string", () => {
    const result = parsePreference<{ visible: boolean }>(
      JSON.stringify({ visible: true }),
      { visible: false },
    );
    expect(result).toEqual({ visible: true });
  });

  it("parses a JSON array string", () => {
    const result = parsePreference<string[]>(JSON.stringify(["a", "b"]), []);
    expect(result).toEqual(["a", "b"]);
  });

  it("parses a JSON primitive string", () => {
    expect(parsePreference<boolean>("true", false)).toBe(true);
    expect(parsePreference<number>("42", 0)).toBe(42);
  });

  it("returns fallback when value is undefined", () => {
    const fallback = { visible: false };
    expect(parsePreference<{ visible: boolean }>(undefined, fallback)).toBe(
      fallback,
    );
  });

  it("returns fallback when value is invalid JSON", () => {
    const fallback = { visible: false };
    expect(parsePreference<{ visible: boolean }>("not-json{", fallback)).toBe(
      fallback,
    );
  });

  it("returns fallback for an empty string", () => {
    const fallback = { visible: false };
    expect(parsePreference<{ visible: boolean }>("", fallback)).toBe(fallback);
  });
});
