import type { GenericType } from "./generic";

export interface Wine extends GenericType {
  wineMakerId: number;
  regionId: number | null;
  notes: string | null;
  type:
    | "red"
    | "white"
    | "rose"
    | "orange"
    | "sparkling"
    | "fortified"
    | "dessert";
}

export type CreateWine = {
  name: Wine["name"];
  wineMakerId: Wine["wineMakerId"];
  regionId: Wine["regionId"];
  type: Wine["type"];
  notes?: Wine["notes"];
};

export type UpdateWine = Partial<CreateWine>;
