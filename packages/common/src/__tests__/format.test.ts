import { describe, it, expect } from "vitest";
import {
  formatPrice,
  formatDate,
  formatDateTime,
  formatWineType,
  formatStatus,
  formatBottleSize,
  formatDrinkingWindow,
  formatDrinkingStatus,
} from "../format";

describe("formatPrice", () => {
  it("formats a number as USD currency", () => {
    expect(formatPrice(19.99, "USD")).toBe("$19.99");
  });

  it("formats a string price as currency", () => {
    expect(formatPrice("42.5", "USD")).toBe("$42.50");
  });

  it("formats with EUR currency", () => {
    const result = formatPrice(10, "EUR");
    expect(result).toContain("10.00");
  });

  it("falls back for invalid currency code", () => {
    const result = formatPrice(25, "INVALID");
    expect(result).toBe("25.00 INVALID");
  });
});

describe("formatDate", () => {
  it("formats a date string with the given format", () => {
    expect(formatDate("2024-06-15", "yyyy-MM-dd")).toBe("2024-06-15");
  });

  it("formats with a different pattern", () => {
    expect(formatDate("2024-06-15", "dd/MM/yyyy")).toBe("15/06/2024");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO datetime string", () => {
    const result = formatDateTime("2024-06-15T14:30:00Z", "yyyy-MM-dd HH:mm");
    expect(result).toContain("2024-06-15");
  });
});

describe("formatWineType", () => {
  it("returns the label for each wine type", () => {
    expect(formatWineType("red")).toBe("Red");
    expect(formatWineType("white")).toBe("White");
    expect(formatWineType("rose")).toBe("Rosé");
    expect(formatWineType("orange")).toBe("Orange");
    expect(formatWineType("sparkling")).toBe("Sparkling");
    expect(formatWineType("fortified")).toBe("Fortified");
    expect(formatWineType("dessert")).toBe("Dessert");
  });
});

describe("formatStatus", () => {
  it("capitalizes a single word", () => {
    expect(formatStatus("active")).toBe("Active");
  });

  it("capitalizes hyphenated words", () => {
    expect(formatStatus("in-cellar")).toBe("In Cellar");
  });

  it("handles multiple hyphens", () => {
    expect(formatStatus("ready-to-drink")).toBe("Ready To Drink");
  });
});

describe("formatBottleSize", () => {
  it("returns label for known sizes", () => {
    expect(formatBottleSize("standard")).toBe("Standard (750ml)");
    expect(formatBottleSize("magnum")).toBe("Magnum (1.5L)");
    expect(formatBottleSize("piccolo")).toBe("Piccolo (187ml)");
  });

  it("formats all known sizes", () => {
    expect(formatBottleSize("half")).toBe("Half (375ml)");
    expect(formatBottleSize("litre")).toBe("Litre (1L)");
    expect(formatBottleSize("double-magnum")).toBe("Double Magnum (3L)");
    expect(formatBottleSize("jeroboam")).toBe("Jeroboam (4.5L)");
    expect(formatBottleSize("imperial")).toBe("Imperial (6L)");
    expect(formatBottleSize("salmanazar")).toBe("Salmanazar (9L)");
    expect(formatBottleSize("balthazar")).toBe("Balthazar (12L)");
    expect(formatBottleSize("nebuchadnezzar")).toBe("Nebuchadnezzar (15L)");
  });
});

describe("formatDrinkingWindow", () => {
  it("returns range when both begin and end provided", () => {
    expect(formatDrinkingWindow(2020, 2030)).toBe("2020 until 2030");
  });

  it("returns 'Now until' when begin is null", () => {
    expect(formatDrinkingWindow(null, 2030)).toBe("Now until 2030");
  });

  it("returns 'From' when end is null", () => {
    expect(formatDrinkingWindow(2025, null)).toBe("From 2025");
  });

  it("returns dash when both are null", () => {
    expect(formatDrinkingWindow(null, null)).toBe("-");
  });
});

describe("formatDrinkingStatus", () => {
  it("returns 'unknown' when both dates are null", () => {
    expect(formatDrinkingStatus(null, null, 2024)).toBe("unknown");
  });

  it("returns 'past' when current year is after drinkUntil", () => {
    expect(formatDrinkingStatus(2015, 2020, 2024)).toBe("past");
  });

  it("returns 'wait' when current year is before drinkFrom", () => {
    expect(formatDrinkingStatus(2030, 2040, 2024)).toBe("wait");
  });

  it("returns 'drinkable' when in the window", () => {
    expect(formatDrinkingStatus(2020, 2030, 2024)).toBe("drinkable");
  });

  it("returns 'drinkable' when drinkFrom is null but drinkUntil is in future", () => {
    expect(formatDrinkingStatus(null, 2030, 2024)).toBe("drinkable");
  });

  it("returns 'drinkable' when drinkUntil is null but drinkFrom has passed", () => {
    expect(formatDrinkingStatus(2020, null, 2024)).toBe("drinkable");
  });

  it("returns 'past' when only drinkUntil is set and passed", () => {
    expect(formatDrinkingStatus(null, 2020, 2024)).toBe("past");
  });

  it("returns 'drinkable' at exact drinkFrom year", () => {
    expect(formatDrinkingStatus(2024, 2030, 2024)).toBe("drinkable");
  });

  it("returns 'past' at year after drinkUntil", () => {
    expect(formatDrinkingStatus(2020, 2024, 2025)).toBe("past");
  });

  it("returns 'drinkable' at exact drinkUntil year", () => {
    expect(formatDrinkingStatus(2020, 2024, 2024)).toBe("drinkable");
  });
});
