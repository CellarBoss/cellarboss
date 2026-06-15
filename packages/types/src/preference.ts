export interface Preference {
  userId: string;
  key: string;
  value: string;
}

export type UpsertPreference = Pick<Preference, "value">;
