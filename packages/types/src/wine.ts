export interface Wine {
  id: number;
  name: string;
  wineMakerId: number;
  regionId: number | null;
}

export type CreateWine = Omit<Wine, 'id'>;

export type UpdateWine = Partial<Omit<Wine, 'id'>>;