"use client";

import { DataSelector } from "../selector/DataSelector";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import type { SelectorConfig } from "@/lib/types/field";

type FieldProps = {
  name: string;
  label: string;
  editable?: boolean;
  selectorConfig?: SelectorConfig;
  onChange?: (value: string) => void;
  form: any;
};

export function GenericField({
  form,
  name,
  label,
  selectorConfig,
  editable = true,
}: FieldProps) {
  return (
    <form.Field
      name={name}
      children={(field: any) => {
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
    />
  );
}
