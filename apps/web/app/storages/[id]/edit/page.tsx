"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getStorageById } from "@/lib/api/storages";
import type { Storage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { storageFields } from "@/lib/fields/storages";
import { updateStorage } from "@/lib/api/storages";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

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

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["storage", storageId],
    queryFn: () => getStorageById(storageId),
    enabled: !!storageId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var storage = queryResult.data;

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
