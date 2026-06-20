import { describe, expect, it } from "vitest";
import type { Country, Region, Wine } from "@cellarboss/types";
import { matchByName, matchRegion, matchWine } from "../match/matcher";

const countries: Country[] = [
  { id: 1, name: "Spain" },
  { id: 2, name: "France" },
];

const regions: Region[] = [
  { id: 10, name: "Rioja", countryId: 1 },
  { id: 20, name: "Bordeaux", countryId: 2 },
];

describe("matchByName", () => {
  it("matches exactly, ignoring accents and case", () => {
    const result = matchByName("château coufran", [
      { id: 1, name: "Château Coufran" },
    ]);
    expect(result.matchId).toBe(1);
  });

  it("returns no match for empty input", () => {
    expect(matchByName("", countries).matchId).toBeNull();
    expect(matchByName(null, countries).matchId).toBeNull();
  });

  it("returns no confident match for unrelated names", () => {
    const result = matchByName("Germany", countries);
    expect(result.matchId).toBeNull();
  });
});

describe("matchRegion (in-country only)", () => {
  it("matches a region within the resolved country", () => {
    expect(matchRegion("Bordeaux", 2, regions).matchId).toBe(20);
  });

  it("does NOT match a region that belongs to a different country", () => {
    // Bordeaux exists, but the resolved country is Spain (1) — regression for
    // the wrong-country bug from PR #563.
    expect(matchRegion("Bordeaux", 1, regions).matchId).toBeNull();
  });

  it("treats the region as new when the country is unknown", () => {
    expect(matchRegion("Bordeaux", null, regions).matchId).toBeNull();
  });
});

describe("matchWine (scoped by winemaker)", () => {
  const wines: Wine[] = [
    { id: 100, name: "Reserva", wineMakerId: 1, regionId: null, type: "red" },
    { id: 200, name: "Reserva", wineMakerId: 2, regionId: null, type: "red" },
  ];

  it("scopes matches to the given winemaker", () => {
    expect(matchWine("Reserva", 2, wines).matchId).toBe(200);
  });

  it("matches across all wines when no winemaker given", () => {
    expect(matchWine("Reserva", null, wines).matchId).not.toBeNull();
  });
});
