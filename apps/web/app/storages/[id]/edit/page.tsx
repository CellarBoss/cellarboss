"use client";

import { useParams } from 'next/navigation';
import { getStorageById } from "@/lib/api/storages";
import type { Storage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { storageFields } from "@/lib/fields/storages";
import { updateStorage } from "@/lib/api/storages";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";

async function handleUpdate(storage: Storage): Promise<ApiResult<Storage>> {
  console.log("Update storage:", storage);

  try {
    return updateStorage(storage);
  } catch (err: any) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditStoragePage() {
  const params = useParams();
  const storageId = Number(params.id);

  const storageQuery = useApiQuery({
    queryKey: ["storage", storageId],
    queryFn: () => getStorageById(storageId),
    enabled: !!storageId,
  });

  const result = queryGate(storageQuery);
  if (!result.ready) return result.gate;

  const [storage] = result.data;

  return (
    <section>
      <PageHeader title="Edit Storage" />
      <GenericCard<Storage>
        mode="edit"
        data={storage}
        fields={storageFields}
        processSave={handleUpdate}
        redirectTo="/storages"
      />
    </section>
  );
}
