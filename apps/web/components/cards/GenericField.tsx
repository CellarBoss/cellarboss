"use client";

import { DataSelector } from "../selector/DataSelector";
import { WineVintageSelector } from "../selector/WineVintageSelector";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { DateField } from "./DateField";
import { FixedListField } from "./FixedListField";
import { WineGlassRating } from "./WineGlassRating";
import type { SelectorConfig, SelectOption } from "@/lib/types/field";

type FieldProps = {
  name: string;
  label: string;
  editable?: boolean;
  type?:
    | "text"
    | "password"
    | "number"
    | "textarea"
    | "selector"
    | "date"
    | "fixed-list"
    | "wine-vintage"
    | "wine-rating";
  numberProps?: { min?: number; max?: number; step?: number };
  selectorConfig?: SelectorConfig;
  options?: SelectOption[];
  onChange?: (value: string) => void;
  form: any;
};

export function GenericField({
  form,
  name,
  label,
  type,
  numberProps,
  selectorConfig,
  options,
  editable = true,
}: FieldProps) {
  return (
    <form.Field name={name}>
      {(field: any) => {
        const isInvalid =
          editable && field.state.meta.isTouched && !field.state.meta.isValid;

        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

            {selectorConfig ? (
              <DataSelector
                selectorConfig={selectorConfig}
                field={field}
                editable={editable}
              />
            ) : type === "wine-vintage" ? (
              <WineVintageSelector field={field} editable={editable} />
            ) : type === "wine-rating" ? (
              <WineGlassRating field={field} editable={editable} />
            ) : type === "date" ? (
              <DateField field={field} editable={editable} />
            ) : type === "fixed-list" && options ? (
              <FixedListField
                field={field}
                editable={editable}
                options={options}
              />
            ) : type === "number" ? (
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                type="number"
                {...numberProps}
                disabled={!editable}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                autoComplete="off"
              />
            ) : type === "password" ? (
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                type="password"
                disabled={!editable}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                autoComplete="off"
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value ?? ""}
                type="text"
                disabled={!editable}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                autoComplete="off"
              />
            )}

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
          </Field>
        );
      }}
    </form.Field>
  );
}
