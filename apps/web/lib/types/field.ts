import * as z from "zod";
import type { GenericType } from "@cellarboss/types";
import type { ApiResult } from "@/lib/api/types";

type FieldValue<T, K extends keyof T> = T[K];

export type GroupByConfig = {
  key: string;
  queryKey: string;
  queryFn: () => Promise<ApiResult<GenericType[]>>;
};

export type SelectorConfig = {
  queryKey: string;
  queryFn: () => Promise<ApiResult<GenericType[]>>;
  allowMultiple?: boolean;
  groupBy?: GroupByConfig;
  hierarchical?: boolean;
};

export type SelectOption = { value: string; label: string };

export type FieldConfig<T, K extends keyof T = keyof T> = {
  key: keyof T;
  label: string;
  editable?: boolean;
  validator?: z.ZodType<FieldValue<T, K>>;
} & (
  | { type?: "text" | "textarea"; selectorConfig?: never; options?: never }
  | { type?: "password"; selectorConfig?: never; options?: never }
  | {
      type: "number";
      numberProps?: { min?: number; max?: number; step?: number };
      selectorConfig?: never;
      options?: never;
    }
  | { type: "selector"; selectorConfig: SelectorConfig; options?: never }
  | { type: "date"; selectorConfig?: never; options?: never }
  | { type: "fixed-list"; options: SelectOption[]; selectorConfig?: never }
  | { type: "wine-vintage"; selectorConfig?: never; options?: never }
);
