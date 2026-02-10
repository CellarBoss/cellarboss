"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelector } from "../selector/GenericSelector";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { getCountries } from "@/lib/api/countries";
import type { Country } from "@cellarboss/types";

type FieldProps = {
  name: string;
  label: string;
  editable?: boolean;
  type?: string;
  onChange?: (value: string) => void;
  form: any;
};

type SelectorProps = {
  field: any;
  editable: boolean;
}

function CountrySelector({ editable, field }: SelectorProps) {
  const { data: countries, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  })

  if(isLoading) { return <span>Loading... </span> }
  if(!countries?.ok) { throw new Error("Failed to fetch countries"); }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <GenericSelector<Country>
      field={field}
      options={countries.data}
      editable={editable}
      isInvalid={isInvalid}
    />
  );
}

export function GenericField({
  form,
  name,
  label,
  type,
  editable = true,
}: FieldProps) {
  switch (type) {
    default:
    case "text":
      return (
        <form.Field
          name={name}
          children={(field: any) => {
            const isInvalid = editable && field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
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
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        />
      );

    case "country":
      return (
        <form.Field
          name={name}
          children={(field: any) => {
            const isInvalid = editable && field.state.meta.isTouched && !field.state.meta.isValid;
            
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <CountrySelector
                  editable={editable}
                  field={field}
                 />

                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        />
      );

  }

};