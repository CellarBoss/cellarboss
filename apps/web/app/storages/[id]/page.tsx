"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getStorageById } from "@/lib/api/storages";
import type { Storage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { storageFields } from "@/lib/fields/storages";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function ViewStoragePage() {
  const params = useParams();
  const storageId = params.id;

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ['storage', storageId],
    queryFn: () => getStorageById(Number(storageId)),
    enabled: !!storageId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var storage = queryResult.data;

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
