"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getGrapeById } from "@/lib/api/grapes";
import type { Grape } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { grapeFields } from "@/lib/fields/grapes";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function ViewGrapePage() {
  const params = useParams();
  const grapeId = params.id;

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ['grape', grapeId],
    queryFn: () => getGrapeById(Number(grapeId)), 
    enabled: !!grapeId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var grape = queryResult.data;

  return (
    <section>
      <PageHeader title={`View Grape - ${grape.name}`} />
      <GenericCard<Grape>
        mode="view"
        data={grape}
        fields={grapeFields}
      />
    </section>
  );
}
