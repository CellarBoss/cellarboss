export interface Image {
  id: number;
  vintageId: number;
  filename: string;
  size: number;
  sortOrder: number;
  createdBy: string; // FK to user.id, set server-side
  createdAt: string; // ISO 8601
}
