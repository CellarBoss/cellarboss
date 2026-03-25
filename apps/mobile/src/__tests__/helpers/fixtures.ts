import type {
  Wine,
  Vintage,
  Bottle,
  WineMaker,
  Country,
  Region,
  Grape,
  Location,
  Storage,
  TastingNote,
} from "@cellarboss/types";

export const countries: Country[] = [
  { id: 1, name: "France" },
  { id: 2, name: "Australia" },
  { id: 3, name: "Italy" },
];

export const regions: Region[] = [
  { id: 1, name: "Burgundy", countryId: 1 },
  { id: 2, name: "Bordeaux", countryId: 1 },
  { id: 3, name: "Barossa Valley", countryId: 2 },
];

export const grapes: Grape[] = [
  { id: 1, name: "Pinot Noir" },
  { id: 2, name: "Cabernet Sauvignon" },
  { id: 3, name: "Chardonnay" },
];

export const locations: Location[] = [
  { id: 1, name: "Home Cellar" },
  { id: 2, name: "Wine Fridge" },
];

export const storages: Storage[] = [
  { id: 1, name: "Rack A", locationId: 1, parent: null },
  { id: 2, name: "Rack B", locationId: 1, parent: null },
  { id: 3, name: "Shelf 1", locationId: 1, parent: 1 },
];

export const winemakers: WineMaker[] = [
  { id: 1, name: "Domaine de la Romanée-Conti" },
  { id: 2, name: "Château Margaux" },
  { id: 3, name: "Penfolds" },
];

export const wines: Wine[] = [
  {
    id: 1,
    name: "Romanée-Conti Grand Cru",
    wineMakerId: 1,
    regionId: 1,
    type: "red",
  },
  {
    id: 2,
    name: "Château Margaux Premier Grand Cru",
    wineMakerId: 2,
    regionId: 2,
    type: "red",
  },
  {
    id: 3,
    name: "Bin 389 Cabernet Shiraz",
    wineMakerId: 3,
    regionId: 3,
    type: "red",
  },
  {
    id: 4,
    name: "Puligny-Montrachet",
    wineMakerId: 1,
    regionId: 1,
    type: "white",
  },
  {
    id: 5,
    name: "Rosé de Margaux",
    wineMakerId: 2,
    regionId: 2,
    type: "rose",
  },
];

export const vintages: Vintage[] = [
  { id: 1, year: 2015, wineId: 1, drinkFrom: 2025, drinkUntil: 2060 },
  { id: 2, year: 2018, wineId: 2, drinkFrom: 2028, drinkUntil: 2055 },
  { id: 3, year: 2020, wineId: 3, drinkFrom: 2023, drinkUntil: 2027 },
  { id: 4, year: 2019, wineId: 4, drinkFrom: 2022, drinkUntil: 2026 },
  { id: 5, year: 2021, wineId: 5, drinkFrom: 2022, drinkUntil: 2024 },
];

export const bottles: Bottle[] = [
  {
    id: 1,
    purchaseDate: "2023-01-15",
    purchasePrice: 5000,
    vintageId: 1,
    storageId: 1,
    status: "stored",
    size: "standard",
  },
  {
    id: 2,
    purchaseDate: "2023-03-20",
    purchasePrice: 300,
    vintageId: 2,
    storageId: 1,
    status: "stored",
    size: "standard",
  },
  {
    id: 3,
    purchaseDate: "2023-06-10",
    purchasePrice: 40,
    vintageId: 3,
    storageId: 2,
    status: "stored",
    size: "standard",
  },
  {
    id: 4,
    purchaseDate: "2023-09-01",
    purchasePrice: 80,
    vintageId: 4,
    storageId: 2,
    status: "stored",
    size: "standard",
  },
  {
    id: 5,
    purchaseDate: "2024-01-10",
    purchasePrice: 25,
    vintageId: 5,
    storageId: null,
    status: "drunk",
    size: "standard",
  },
  {
    id: 6,
    purchaseDate: "2024-02-14",
    purchasePrice: 40,
    vintageId: 3,
    storageId: 1,
    status: "stored",
    size: "magnum",
  },
];

export const tastingNotes: TastingNote[] = [
  {
    id: 1,
    vintageId: 1,
    date: "2025-01-10T12:00:00Z",
    authorId: "user-1",
    author: "Admin User",
    score: 9,
    notes: "Exceptional complexity and depth",
  },
  {
    id: 2,
    vintageId: 3,
    date: "2025-02-15T12:00:00Z",
    authorId: "user-1",
    author: "Admin User",
    score: 7,
    notes: "Good everyday drinking wine",
  },
];
