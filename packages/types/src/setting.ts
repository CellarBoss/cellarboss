export interface Setting {
  key: string;
  value: string;
}

export type UpdateSetting = Omit<Setting, "key">;
