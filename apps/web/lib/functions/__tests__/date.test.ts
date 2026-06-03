import { describe, expect, it } from "vitest";
import { formatDateOnly, parseDateOnly } from "../date";

describe("parseDateOnly", () => {
  it("parses date-only strings as local calendar dates", () => {
    const date = parseDateOnly("2026-06-04");

    expect(date).toBeInstanceOf(Date);
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(5);
    expect(date?.getDate()).toBe(4);
  });

  it("rejects invalid date-only strings", () => {
    expect(parseDateOnly("2026-02-31")).toBeUndefined();
    expect(parseDateOnly("2026-6-4")).toBeUndefined();
    expect(parseDateOnly("not-a-date")).toBeUndefined();
  });
});

describe("formatDateOnly", () => {
  it("formats local calendar dates without UTC conversion", () => {
    const date = new Date(2026, 5, 4);

    expect(formatDateOnly(date)).toBe("2026-06-04");
  });

  it("pads single-digit months and days", () => {
    const date = new Date(2026, 0, 5);

    expect(formatDateOnly(date)).toBe("2026-01-05");
  });
});
