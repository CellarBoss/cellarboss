"use client";

import { skipToken } from "@tanstack/react-query";
import type { SelectorConfig } from "@/lib/types/field";
import type { GenericType } from "@cellarboss/types";
import MultiSelector from "./MultipleSelector";
import SingleSelector from "./SingleSelector";
import { useApiQuery } from "@/hooks/use-api-query";

export type OptionGroup = {
  label: string;
  options: GenericType[];
};

type DataSelectorProps = {
  selectorConfig: SelectorConfig;
  field: any;
  editable: boolean;
};

export function DataSelector({ selectorConfig, field, editable }: DataSelectorProps) {
  const { queryKey, queryFn, allowMultiple = false, groupBy } = selectorConfig;

  const { data, isLoading } = useApiQuery<GenericType[]>({
    queryKey: [queryKey],
    queryFn: queryFn,
  });

  const { data: groupData, isLoading: groupLoading } = useApiQuery<GenericType[]>({
    queryKey: [groupBy?.queryKey ?? "unused"],
    queryFn: groupBy ? groupBy.queryFn : skipToken,
  });

  if (isLoading || (groupBy && groupLoading)) {
    return <span>Loading...</span>;
  }

  if (!data) {
    throw new Error(`Failed to fetch ${queryKey}`);
  }

  if (groupBy && !groupData) {
    throw new Error(`Failed to fetch ${groupBy.queryKey}`);
  }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const groups =
    groupBy && groupData
      ? buildGroups(data, groupData, groupBy.key)
      : undefined;

  if (allowMultiple) {
    return (
      <MultiSelector
        options={data}
        isInvalid={isInvalid}
        editable={editable}
        field={field}
      />
    );
  }

  return (
    <SingleSelector
      options={data}
      isInvalid={isInvalid}
      editable={editable}
      field={field}
      groups={groups}
    />
  );
}

function buildGroups(
  options: GenericType[],
  groupEntities: GenericType[],
  key: string,
): OptionGroup[] {
  const groupMap = new Map<number, string>();
  for (const entity of groupEntities) {
    groupMap.set(entity.id, entity.name);
  }

  const buckets = new Map<number, GenericType[]>();
  const ungrouped: GenericType[] = [];

  for (const option of options) {
    const groupId = (option as unknown as Record<string, unknown>)[key];
    if (typeof groupId === "number" && groupMap.has(groupId)) {
      if (!buckets.has(groupId)) {
        buckets.set(groupId, []);
      }
      buckets.get(groupId)!.push(option);
    } else {
      ungrouped.push(option);
    }
  }

  const result: OptionGroup[] = [];
  for (const entity of groupEntities) {
    const items = buckets.get(entity.id);
    if (items && items.length > 0) {
      result.push({ label: entity.name, options: items });
    }
  }

  if (ungrouped.length > 0) {
    result.push({ label: "Other", options: ungrouped });
  }

  return result;
}
