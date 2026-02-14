"use client";

import { useQuery } from "@tanstack/react-query";
import { GenericSelector } from "./GenericSelector";
import type { SelectorConfig } from "@/lib/types/field";
import type { GenericType } from "@cellarboss/types";

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

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: queryFn,
  });

  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: [groupBy?.queryKey],
    queryFn: groupBy?.queryFn,
    enabled: !!groupBy,
  });

  if (isLoading || (groupBy && groupLoading)) {
    return <span>Loading...</span>;
  }

  if (!data?.ok) {
    throw new Error(`Failed to fetch ${queryKey}`);
  }

  if (groupBy && !groupData?.ok) {
    throw new Error(`Failed to fetch ${groupBy.queryKey}`);
  }

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const groups =
    groupBy && groupData?.ok
      ? buildGroups(data.data, groupData.data, groupBy.key)
      : undefined;

  return (
    <GenericSelector
      field={field}
      options={data.data}
      editable={editable}
      isInvalid={isInvalid}
      allowMultiple={allowMultiple}
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
