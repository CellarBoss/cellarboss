"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelector } from "../selector/GenericSelector";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { getCountries } from "@/lib/api/countries";
import { getLocations } from "@/lib/api/locations";
import { getStorages } from "@/lib/api/storages";
import type { Country } from "@cellarboss/types";
import type { Location } from "@cellarboss/types";
import type { Storage } from "@cellarboss/types";

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

function LocationSelector({ editable, field }: SelectorProps) {
  const { data: locations, isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  })

  if(isLoading) { return <span>Loading... </span> }
  if(!locations?.ok) { throw new Error("Failed to fetch locations"); }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <GenericSelector<Location>
      field={field}
      options={locations.data}
      editable={editable}
      isInvalid={isInvalid}
    />
  );
}

function StorageSelector({ editable, field }: SelectorProps) {
  const { data: storages, isLoading } = useQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  })

  if(isLoading) { return <span>Loading... </span> }
  if(!storages?.ok) { throw new Error("Failed to fetch storages"); }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <GenericSelector<Storage>
      field={field}
      options={storages.data}
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

    case "location":
      return (
        <form.Field
          name={name}
          children={(field: any) => {
            const isInvalid = editable && field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <LocationSelector
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

    case "storage":
      return (
        <form.Field
          name={name}
          children={(field: any) => {
            const isInvalid = editable && field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <StorageSelector
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