import { mockOk } from "./mock-api";
import {
  bottles,
  vintages,
  wines,
  winemakers,
  storages,
  locations,
  countries,
  regions,
  grapes,
  tastingNotes,
} from "./fixtures";

export const mockApi = {
  bottles: {
    getAll: jest.fn().mockResolvedValue(mockOk(bottles)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  vintages: {
    getAll: jest.fn().mockResolvedValue(mockOk(vintages)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  wines: {
    getAll: jest.fn().mockResolvedValue(mockOk(wines)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  winemakers: {
    getAll: jest.fn().mockResolvedValue(mockOk(winemakers)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  storages: {
    getAll: jest.fn().mockResolvedValue(mockOk(storages)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  locations: {
    getAll: jest.fn().mockResolvedValue(mockOk(locations)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  countries: {
    getAll: jest.fn().mockResolvedValue(mockOk(countries)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  regions: {
    getAll: jest.fn().mockResolvedValue(mockOk(regions)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  grapes: {
    getAll: jest.fn().mockResolvedValue(mockOk(grapes)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tastingNotes: {
    getAll: jest.fn().mockResolvedValue(mockOk(tastingNotes)),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  winegrapes: {
    getAll: jest.fn().mockResolvedValue(mockOk([])),
    getByWineId: jest.fn().mockResolvedValue(mockOk([])),
    create: jest.fn(),
    delete: jest.fn(),
  },
  settings: {
    getAll: jest.fn().mockResolvedValue(mockOk([])),
    update: jest.fn(),
  },
};

jest.mock("@/lib/api/client", () => ({
  api: mockApi,
}));
