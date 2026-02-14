import * as z from "zod";
import type { GenericType } from "@cellarboss/types";
import type { ApiResult } from "@/lib/api/frontend";

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
};

export type FieldConfig<T, K extends keyof T = keyof T> = {
  key: keyof T;
  label: string;
  editable?: boolean;
  validator?: z.ZodType<FieldValue<T, K>>;
} & (
  | { type?: "text" | "number" | "textarea"; selectorConfig?: never }
  | { type: "selector"; selectorConfig: SelectorConfig }
);
