import { z } from "zod";

const nullablePreprocess = (val: unknown) =>
  val === "" || val === null || val === undefined ? null : Number(val);

/** Nullable positive integer ID field. Converts empty strings to null. */
export const nullableId = () =>
  z.preprocess(nullablePreprocess, z.number().int().positive().nullable());

/** Nullable integer field with min/max bounds. Converts empty strings to null. */
export const nullableInt = (min: number, max: number) =>
  z.preprocess(
    nullablePreprocess,
    z.number().int().min(min).max(max).nullable(),
  );
