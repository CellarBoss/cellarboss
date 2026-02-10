"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getRegionById } from "@/lib/api/regions";
import type { Region } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { PageHeader } from "@/components/page/PageHeader";
import { regionFields } from "@/lib/fields/regions";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function ViewCountryPage() {
  const params = useParams();
  const regionId = params.id;

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ['region', regionId],
    queryFn: () => getRegionById(Number(regionId)), 
    enabled: !!regionId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var region = queryResult.data;

  return (
    <section>
      <PageHeader title={`View Region - ${region.name}`} />
      <GenericCard<Region>
        mode="view"
        data={region}
        fields={regionFields}
      />
    </section>
  );
}
