import type { WineType } from "@cellarboss/validators/constants";
export type { WineType };

export type ScrapeResult = {
  wineName: string | null;
  year: number | null;
  wineType: WineType | null;
  winemakerName: string | null;
  countryName: string | null;
  regionName: string | null;
  grapeNames: string[];
  pricePerBottle: number | null;
};
