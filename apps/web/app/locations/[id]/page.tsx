"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getLocationById } from "@/lib/api/locations";
import type { Location } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { locationFields } from "@/lib/fields/locations";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function ViewLocationPage() {
  const params = useParams();
  const locationId = params.id;

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocationById(Number(locationId)),
    enabled: !!locationId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var location = queryResult.data;

  return (
    <section>
      <PageHeader title={`View Location - ${location.name}`} />
      <GenericCard<Location>
        mode="view"
        data={location}
        fields={locationFields}
      />
    </section>
  );
}
