"use client";

import { useParams } from 'next/navigation';
import { getStorageById } from "@/lib/api/storages";
import type { Storage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { storageFields } from "@/lib/fields/storages";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";

export default function ViewStoragePage() {
  const params = useParams();
  const storageId = params.id;

  const storageQuery = useApiQuery({
    queryKey: ['storage', storageId],
    queryFn: () => getStorageById(Number(storageId)),
    enabled: !!storageId,
  });

  const result = queryGate(storageQuery);
  if (!result.ready) return result.gate;

  const [storage] = result.data;

  return (
    <section>
      <PageHeader title={`View Storage - ${storage.name}`} />
      <GenericCard<Storage>
        mode="view"
        data={storage}
        fields={storageFields}
      />
    </section>
  );
}
