import type { Generated } from "kysely";
import type {
  Bottle,
  Country,
  Grape,
  Image,
  Location,
  Region,
  Storage,
  TastingNote,
  Vintage,
  Wine,
  WineGrape,
  WineMaker,
  Setting,
} from "@cellarboss/types";

// Kysely table definitions - wrap auto-increment IDs with Generated<>
export interface BottleTable extends Omit<Bottle, "id"> {
  id: Generated<number>;
}

export interface CountryTable extends Omit<Country, "id"> {
  id: Generated<number>;
}

export interface GrapeTable extends Omit<Grape, "id"> {
  id: Generated<number>;
}

export interface LocationTable extends Omit<Location, "id"> {
  id: Generated<number>;
}

export interface RegionTable extends Omit<Region, "id"> {
  id: Generated<number>;
}

export interface StorageTable extends Omit<Storage, "id"> {
  id: Generated<number>;
}

export interface VintageTable extends Omit<Vintage, "id"> {
  id: Generated<number>;
}

export interface WineTable extends Omit<Wine, "id"> {
  id: Generated<number>;
}

export interface WineGrapeTable extends Omit<WineGrape, "id"> {
  id: Generated<number>;
}

export interface WineMakerTable extends Omit<WineMaker, "id"> {
  id: Generated<number>;
}

export interface TastingNoteTable extends Omit<TastingNote, "id" | "author"> {
  id: Generated<number>;
}

export interface ImageTable extends Omit<Image, "id"> {
  id: Generated<number>;
}

export interface SettingTable extends Setting {}

// Better Auth managed table - only fields needed for joins
export interface UserTable {
  id: string;
  name: string;
  email: string;
}

// Database interface for Kysely
export interface Database {
  bottle: BottleTable;
  country: CountryTable;
  grape: GrapeTable;
  location: LocationTable;
  region: RegionTable;
  storage: StorageTable;
  vintage: VintageTable;
  wine: WineTable;
  winegrape: WineGrapeTable;
  winemaker: WineMakerTable;
  tastingNote: TastingNoteTable;
  image: ImageTable;
  setting: SettingTable;
  user: UserTable;
}
