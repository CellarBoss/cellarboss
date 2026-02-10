import * as z from "zod";

type FieldValue<T, K extends keyof T> = T[K];

export type FieldConfig<T, K extends keyof T = keyof T> = {
  key: keyof T;
  label: string;
  type?: "text" | "number" | "textarea" | "country";
  editable?: boolean;
  validator?: z.ZodType<FieldValue<T, K>>;
};