import type { MockState } from "./index";

export const defaultState: MockState = {
  session: {
    user: {
      id: "admin-user-1",
      name: "Test Admin",
      email: "admin@cellarboss.test",
      role: "admin",
    },
    session: {
      id: "session-admin-1",
      token: "token-admin",
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
  },
  winemakers: [
    { id: 1, name: "Château Margaux" },
    { id: 2, name: "Domaine Leflaive" },
  ],
  countries: [
    { id: 1, name: "France" },
    { id: 2, name: "Italy" },
  ],
  regions: [
    { id: 1, name: "Bordeaux", countryId: 1 },
    { id: 2, name: "Burgundy", countryId: 1 },
  ],
  grapes: [
    { id: 1, name: "Cabernet Sauvignon" },
    { id: 2, name: "Chardonnay" },
  ],
  wines: [
    {
      id: 1,
      name: "Château Margaux 2015",
      type: "red",
      wineMakerId: 1,
      regionId: 1,
    },
    {
      id: 2,
      name: "Meursault Premier Cru",
      type: "white",
      wineMakerId: 2,
      regionId: 2,
    },
  ],
  vintages: [
    { id: 1, wineId: 1, year: 2015, drinkFrom: 2022, drinkUntil: 2035 },
    { id: 2, wineId: 2, year: 2020, drinkFrom: null, drinkUntil: 2030 },
  ],
  locations: [{ id: 1, name: "Home Cellar" }],
  storages: [
    { id: 1, name: "Rack A", parent: null, locationId: 1 },
    { id: 2, name: "Shelf 1", parent: 1, locationId: 1 },
  ],
  bottles: [
    {
      id: 1,
      vintageId: 1,
      purchaseDate: "2022-06-15",
      purchasePrice: 150.0,
      storageId: 2,
      status: "stored",
    },
  ],
  settings: [
    { key: "currency", value: "USD" },
    { key: "date", value: "yyyy-MM-dd" },
    { key: "datetime", value: "yyyy-MM-dd HH:mm" },
  ],
  users: [
    {
      id: "admin-user-1",
      name: "Test Admin",
      email: "admin@cellarboss.test",
      role: "admin",
      createdAt: "2024-01-01T00:00:00.000Z",
      banned: null,
      banReason: null,
    },
  ],
};
