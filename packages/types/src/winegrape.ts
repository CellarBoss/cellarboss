export interface WineGrape {
  id: number;
  wineId: number;
  grapeId: number;
}

export type CreateWineGrape = Omit<WineGrape, 'id'>;

export type UpdateWineGrape = Partial<Omit<WineGrape, 'id'>>;