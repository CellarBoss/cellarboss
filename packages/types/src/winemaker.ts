export interface WineMaker {
  id: number;
  name: string;
}

export type CreateWineMaker = Omit<WineMaker, 'id'>;

export type UpdateWineMaker = Partial<Omit<WineMaker, 'id'>>;