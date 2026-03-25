/**
 * Base type for individual setting values after parsing
 * - Strings representing numbers are converted to numbers
 * - Strings "true"/"false" are converted to booleans
 * - "null" strings are converted to null
 */
export type SettingValueType = string | number | boolean | null;

/**
 * Parsed settings map returned from the API after type conversion
 */
export type ParsedSettingsMap = Map<string, SettingValueType>;

export function parseValue(value: string): SettingValueType {
  if (value === "null" || value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;

  if (!isNaN(Number(value)) && value !== "") {
    return Number(value);
  }

  return value;
}
