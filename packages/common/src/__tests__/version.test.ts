import { describe, it, expect } from "vitest";
import { isVersionMismatch } from "../hooks/use-version-mismatch";

describe("isVersionMismatch", () => {
  it("returns true when frontend major is newer", () => {
    expect(isVersionMismatch("2.0.0", "1.0.0")).toBe(true);
  });

  it("returns true when frontend minor is newer", () => {
    expect(isVersionMismatch("1.2.0", "1.1.0")).toBe(true);
  });

  it("returns true when frontend patch is newer", () => {
    expect(isVersionMismatch("1.1.1", "1.1.0")).toBe(true);
  });

  it("returns false when backend is newer", () => {
    expect(isVersionMismatch("1.1.0", "1.2.0")).toBe(false);
  });

  it("returns false when versions are equal", () => {
    expect(isVersionMismatch("1.1.0", "1.1.0")).toBe(false);
  });

  it("returns false when frontend is development", () => {
    expect(isVersionMismatch("development", "1.0.0")).toBe(false);
  });

  it("returns false when backend is development", () => {
    expect(isVersionMismatch("1.0.0", "development")).toBe(false);
  });

  it("returns false when both are development", () => {
    expect(isVersionMismatch("development", "development")).toBe(false);
  });

  it("handles v prefix on both versions", () => {
    expect(isVersionMismatch("v1.2.0", "v1.1.0")).toBe(true);
  });

  it("handles v prefix on frontend only", () => {
    expect(isVersionMismatch("v1.2.0", "1.1.0")).toBe(true);
  });

  it("handles v prefix on backend only", () => {
    expect(isVersionMismatch("1.2.0", "v1.1.0")).toBe(true);
  });

  it("returns false for unparseable frontend version", () => {
    expect(isVersionMismatch("not-a-version", "1.0.0")).toBe(false);
  });

  it("returns false for unparseable backend version", () => {
    expect(isVersionMismatch("1.0.0", "not-a-version")).toBe(false);
  });

  it("compares correctly when major is lower but minor is higher", () => {
    expect(isVersionMismatch("1.9.0", "2.0.0")).toBe(false);
  });
});
