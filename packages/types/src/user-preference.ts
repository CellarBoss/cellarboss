import type { JsonValue } from "./json";

export interface UserPreference<TValue extends JsonValue = JsonValue> {
  key: string;
  value: TValue;
}

export type UpsertUserPreference<TValue extends JsonValue = JsonValue> = Pick<
  UserPreference<TValue>,
  "value"
>;
