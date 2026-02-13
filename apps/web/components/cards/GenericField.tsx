"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelector } from "../selector/GenericSelector";
import { Field, FieldLabel, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { getCountries } from "@/lib/api/countries";
import { getLocations } from "@/lib/api/locations";
import { getStorages } from "@/lib/api/storages";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import type { Country } from "@cellarboss/types";
import type { Location } from "@cellarboss/types";
import type { Storage } from "@cellarboss/types";
import type { WineMaker } from "@cellarboss/types";
import type { Region } from "@cellarboss/types";
import type { Grape } from "@cellarboss/types";

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

function WineMakerSelector({ editable, field }: SelectorProps) {
  const { data: winemakers, isLoading } = useQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  })

  if(isLoading) { return <span>Loading... </span> }
  if(!winemakers?.ok) { throw new Error("Failed to fetch winemakers"); }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <GenericSelector<WineMaker>
      field={field}
      options={winemakers.data}
      editable={editable}
      isInvalid={isInvalid}
    />
  );
}

function RegionSelector({ editable, field }: SelectorProps) {
  const { data: regions, isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  })

  if(isLoading) { return <span>Loading... </span> }
  if(!regions?.ok) { throw new Error("Failed to fetch regions"); }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <GenericSelector<Region>
      field={field}
      options={regions.data}
      editable={editable}
      isInvalid={isInvalid}
    />
  );
}

function GrapeSelector({ editable, field }: SelectorProps) {
  const { data: grapes, isLoading } = useQuery({
    queryKey: ["grapes"],
    queryFn: getGrapes,
  })

  if(isLoading) { return <span>Loading... </span> }
  if(!grapes?.ok) { throw new Error("Failed to fetch grapes"); }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <GenericSelector<Grape>
      field={field}
      options={grapes.data}
      editable={editable}
      isInvalid={isInvalid}
      allowMultiple={true}
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

    case "winemaker":
      return (
        <form.Field
          name={name}
          children={(field: any) => {
            const isInvalid = editable && field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <WineMakerSelector
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

    case "region":
      return (
        <form.Field
          name={name}
          children={(field: any) => {
            const isInvalid = editable && field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <RegionSelector
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

    case "grapes":
      return (
        <form.Field
          name={name}
          children={(field: any) => {
            const isInvalid = editable && field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <GrapeSelector
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