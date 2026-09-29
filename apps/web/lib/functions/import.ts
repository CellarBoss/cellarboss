import type {
  ImportCommit,
  ImportEntityRef,
  ImportPreview,
  ImportResolution,
  Wine,
} from "@cellarboss/types";

/**
 * Selectors with `allowCreate` hold a record that doesn't exist yet as a
 * pending value: this prefix and the new name. Ids are digits only, so the two
 * can't collide.
 */
const PENDING_PREFIX = "new:";

export function pendingValue(name: string): string {
  return PENDING_PREFIX + name.trim();
}

/** The new name for a pending value, or null for an id or empty value. */
export function pendingName(value: string | null | undefined): string | null {
  return value?.startsWith(PENDING_PREFIX)
    ? value.slice(PENDING_PREFIX.length)
    : null;
}

/** The form values an import fills in. Everything is a string, as in GenericCard. */
export type ImportFormValues = {
  name: string;
  type: Wine["type"] | "";
  wineMakerId: string;
  countryId: string;
  regionId: string;
  grapeIds: string[];
  year: string;
  drinkFrom: string;
  drinkUntil: string;
};

export const EMPTY_IMPORT_FORM: ImportFormValues = {
  name: "",
  type: "",
  wineMakerId: "",
  countryId: "",
  regionId: "",
  grapeIds: [],
  year: "",
  drinkFrom: "",
  drinkUntil: "",
};

/**
 * The form value for a resolution. A close match starts on the suggested
 * record; the field status offers to create the new name instead.
 */
export function valueFor(resolution: ImportResolution): string {
  switch (resolution.status) {
    case "matched":
      return String(resolution.id);
    case "suggested":
      return String(resolution.candidates[0].id);
    case "new":
      return pendingValue(resolution.proposedName);
    case "absent":
      return "";
  }
}

/** The grapes' form values, without duplicates or absent ones. */
function grapeValues(resolutions: ImportResolution[]): string[] {
  return [...new Set(resolutions.map(valueFor).filter(Boolean))];
}

/** The name of the record `valueFor` picks, or null when there's none. */
export function resolvedName(resolution: ImportResolution): string | null {
  switch (resolution.status) {
    case "matched":
      return resolution.name;
    case "suggested":
      return resolution.candidates[0].name;
    case "new":
      return resolution.proposedName;
    case "absent":
      return null;
  }
}

export type ResetTarget = { value: string; name: string } | null;

/**
 * What the import filled a selector with, once the user has changed it, so
 * the form can offer it back. Null while the value is still the import's.
 */
export function resetTarget(
  resolution: ImportResolution | undefined,
  value: string,
): ResetTarget {
  if (!resolution) return null;
  const name = resolvedName(resolution);
  const original = valueFor(resolution);
  if (name === null || value === original) return null;
  return { value: original, name };
}

/** As `resetTarget`, for the grapes: the whole list the import filled in. */
export function grapesResetTarget(
  resolutions: ImportResolution[],
  values: string[],
): { values: string[]; names: string[] } | null {
  const original = grapeValues(resolutions);
  const same =
    original.length === values.length &&
    original.every((v) => values.includes(v));
  if (same || original.length === 0) return null;
  const names = [
    ...new Set(
      resolutions
        .map(resolvedName)
        .filter((name): name is string => name !== null),
    ),
  ];
  return { values: original, names };
}

const text = (value: number | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

export function formValuesFromPreview(
  preview: ImportPreview,
): ImportFormValues {
  const { wine, resolution } = preview;
  return {
    name: wine.name?.value ?? "",
    type: wine.type?.value ?? "",
    wineMakerId: valueFor(resolution.winemaker),
    countryId: valueFor(resolution.country),
    regionId: valueFor(resolution.region),
    grapeIds: grapeValues(resolution.grapes),
    year: text(wine.vintage?.year?.value),
    drinkFrom: text(wine.vintage?.drinkFrom?.value),
    drinkUntil: text(wine.vintage?.drinkUntil?.value),
  };
}

export function toRef(value: string): ImportEntityRef | null {
  const name = pendingName(value);
  if (name) return { name };
  if (/^\d+$/.test(value)) return { id: Number(value) };
  return null;
}

const toYear = (value: string) => (value.trim() === "" ? null : Number(value));

/** The commit request for the form. `wineId` adds the vintage to that wine instead. */
export function buildCommit(
  values: ImportFormValues,
  wineId?: number,
): ImportCommit {
  const vintage = {
    year: toYear(values.year),
    drinkFrom: toYear(values.drinkFrom),
    drinkUntil: toYear(values.drinkUntil),
  };
  if (wineId !== undefined) return { wine: { id: wineId }, vintage };

  const winemaker = toRef(values.wineMakerId);
  if (!winemaker) throw new Error("A winemaker must be selected");
  if (!values.type) throw new Error("A wine type must be selected");

  return {
    wine: {
      name: values.name.trim(),
      type: values.type,
      winemaker,
      country: toRef(values.countryId),
      region: toRef(values.regionId),
      grapes: values.grapeIds
        .map(toRef)
        .filter((ref): ref is ImportEntityRef => ref !== null),
    },
    vintage,
  };
}

export type FieldStatus =
  | { kind: "matched" }
  | { kind: "suggested"; proposedName: string }
  | { kind: "new" }
  | null;

/**
 * What to show under a selector for its current value: whether it's the
 * record the import matched, a close match the user can swap for a new
 * record, or a record that will be created. Nothing once the user picks
 * something else.
 */
export function fieldStatus(
  resolution: ImportResolution | undefined,
  value: string,
): FieldStatus {
  if (pendingName(value)) return { kind: "new" };
  if (!resolution || !value) return null;
  if (resolution.status === "matched" && value === String(resolution.id)) {
    return { kind: "matched" };
  }
  if (
    resolution.status === "suggested" &&
    value === String(resolution.candidates[0].id)
  ) {
    return { kind: "suggested", proposedName: resolution.proposedName };
  }
  return null;
}

/** Below this, a filled-in text field gets a "check this" hint. */
export const LOW_CONFIDENCE = 0.6;
