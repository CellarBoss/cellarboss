import * as z from "zod";
import type { GenericType } from "@cellarboss/types";
import type { ApiResult } from "@cellarboss/common";

export type GroupByConfig = {
  key: string;
  queryKey: string;
  queryFn: () => Promise<ApiResult<GenericType[]>>;
};

export type SelectorConfig = {
  queryKey: string;
  queryFn: () => Promise<ApiResult<GenericType[]>>;
  allowMultiple?: boolean;
  allowNone?: boolean;
  hierarchical?: boolean;
  groupBy?: GroupByConfig;
};

export type SelectOption = { value: string; label: string };

export type FieldConfig<T, K extends keyof T = keyof T> = {
  key: keyof T;
  label: string;
  editable?: boolean;
  validator?: z.ZodType<T[K]>;
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
  | { type: "wine-vintage"; selectorConfig?: never; options?: never }
  | { type: "date"; selectorConfig?: never; options?: never }
  | { type: "fixed-list"; options: SelectOption[]; selectorConfig?: never }
  | { type: "price"; selectorConfig?: never; options?: never }
  | { type: "wine-rating"; selectorConfig?: never; options?: never }
  | { type: "quantity-stepper"; selectorConfig?: never; options?: never }
);
