"use client";

import { ChevronRight } from "lucide-react";
import { useApiQuery } from "@/hooks/use-api-query";
import { getStorages } from "@/lib/api/storages";

export function StorageHierarchyDisplay({
  storageId,
}: {
  storageId: number | null;
}) {
  const storageQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });

  if (!storageId) return <span className="text-muted-foreground">—</span>;
  if (storageQuery.isLoading)
    return <span className="text-muted-foreground">...</span>;
  if (!storageQuery.data)
    return <span className="text-muted-foreground">Unknown</span>;

  const storages = storageQuery.data;
  const nameMap = new Map(storages.map((s) => [s.id, s.name]));
  const parentMap = new Map(storages.map((s) => [s.id, s.parent]));

  const segments: string[] = [];
  let current: number | null = storageId;
  while (current !== null) {
    const name = nameMap.get(current);
    if (!name) break;
    segments.unshift(name);
    current = parentMap.get(current) ?? null;
  }

  if (segments.length === 0)
    return <span className="text-muted-foreground">Unknown</span>;

  return (
    <span className="flex items-center gap-1 flex-wrap">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && (
            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
          )}
          <span
            className={
              i < segments.length - 1 ? "text-muted-foreground" : undefined
            }
          >
            {seg}
          </span>
        </span>
      ))}
    </span>
  );
}
