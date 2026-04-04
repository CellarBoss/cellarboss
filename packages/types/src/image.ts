export interface Image {
  id: number;
  vintageId: number;
  filename: string;
  size: number;
  isFavourite: boolean;
  createdBy: string; // FK to user.id, set server-side
  createdAt: string; // ISO 8601
}
