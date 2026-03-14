import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatStatus,
  formatDate,
  formatDateTime,
  formatDrinkingWindow,
  formatDrinkingStatus,
} from "../format";

describe("formatPrice", () => {
  it("formats USD price", () => {
    expect(formatPrice(150, "USD")).toBe("$150.00");
  });

  it("formats EUR price", () => {
    expect(formatPrice(99.5, "EUR")).toContain("99.50");
  });

  it("formats string price input", () => {
    expect(formatPrice("75.5", "USD")).toBe("$75.50");
  });

  it("falls back gracefully for invalid currency", () => {
    const result = formatPrice(100, "INVALID");
    expect(result).toContain("100.00");
  });

  it("formats zero price", () => {
    expect(formatPrice(0, "USD")).toBe("$0.00");
  });
});

describe("formatStatus", () => {
  it("capitalizes single word status", () => {
    expect(formatStatus("stored")).toBe("Stored");
  });

  it("capitalizes hyphenated status", () => {
    expect(formatStatus("in-primeur")).toBe("In Primeur");
  });

  it("handles all bottle statuses", () => {
    expect(formatStatus("ordered")).toBe("Ordered");
    expect(formatStatus("drunk")).toBe("Drunk");
    expect(formatStatus("sold")).toBe("Sold");
    expect(formatStatus("gifted")).toBe("Gifted");
  });
});

describe("formatDate", () => {
  it("formats date with dd/MM/yyyy format", () => {
    expect(formatDate("2024-06-15", "dd/MM/yyyy")).toBe("15/06/2024");
  });

  it("formats date with yyyy-MM-dd format", () => {
    expect(formatDate("2024-06-15", "yyyy-MM-dd")).toBe("2024-06-15");
  });

  it("formats date with MM/dd/yyyy format", () => {
    expect(formatDate("2024-06-15", "MM/dd/yyyy")).toBe("06/15/2024");
  });
});

describe("formatDateTime", () => {
  it("formats datetime with dd/MM/yyyy HH:mm format", () => {
    expect(formatDateTime("2024-06-15 14:30:00", "dd/MM/yyyy HH:mm")).toBe(
      "15/06/2024 14:30",
    );
  });

  it("formats datetime with yyyy-MM-dd HH:mm format", () => {
    expect(formatDateTime("2024-06-15 14:30:00", "yyyy-MM-dd HH:mm")).toBe(
      "2024-06-15 14:30",
    );
  });

  it("formats datetime with dd/MM/yyyy HH:mm:ss format", () => {
    expect(formatDateTime("2024-06-15 14:30:45", "dd/MM/yyyy HH:mm:ss")).toBe(
      "15/06/2024 14:30:45",
    );
  });
});

describe("formatDrinkingWindow", () => {
  it("shows range when both values set", () => {
    expect(formatDrinkingWindow(2022, 2035)).toBe("2022 until 2035");
  });

  it("shows 'Now until' when only drinkUntil set", () => {
    expect(formatDrinkingWindow(null, 2035)).toBe("Now until 2035");
  });

  it("shows 'From' when only drinkFrom set", () => {
    expect(formatDrinkingWindow(2022, null)).toBe("From 2022");
  });

  it("shows '-' when both null", () => {
    expect(formatDrinkingWindow(null, null)).toBe("-");
  });
});

describe("formatDrinkingStatus", () => {
  it("returns unknown when both null", () => {
    expect(formatDrinkingStatus(null, null, 2024)).toBe("unknown");
  });

  it("returns past when current year is after drinkUntil", () => {
    expect(formatDrinkingStatus(2015, 2020, 2024)).toBe("past");
  });

  it("returns wait when current year is before drinkFrom", () => {
    expect(formatDrinkingStatus(2026, 2035, 2024)).toBe("wait");
  });

  it("returns drinkable when within window", () => {
    expect(formatDrinkingStatus(2020, 2030, 2024)).toBe("drinkable");
  });

  it("returns drinkable when drinkFrom is null and not past drinkUntil", () => {
    expect(formatDrinkingStatus(null, 2030, 2024)).toBe("drinkable");
  });

  it("returns drinkable when drinkUntil is null and past drinkFrom", () => {
    expect(formatDrinkingStatus(2020, null, 2024)).toBe("drinkable");
  });
});
