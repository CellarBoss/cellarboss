"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelector } from "./GenericSelector";
import type { SelectorConfig } from "@/lib/types/field";

type DataSelectorProps = {
  selectorConfig: SelectorConfig;
  field: any;
  editable: boolean;
};

export function DataSelector({ selectorConfig, field, editable }: DataSelectorProps) {
  const { queryKey, queryFn, allowMultiple = false } = selectorConfig;

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: queryFn,
  });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!data?.ok) {
    throw new Error(`Failed to fetch ${queryKey}`);
  }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <GenericSelector
      field={field}
      options={data.data}
      editable={editable}
      isInvalid={isInvalid}
      allowMultiple={allowMultiple}
    />
  );
}
