"use client";

import { useParams } from 'next/navigation';
import { getLocationById } from "@/lib/api/locations";
import type { Location } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { locationFields } from "@/lib/fields/locations";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewLocationPage() {
  const params = useParams();
  const locationId = params.id;

  const locationQuery = useApiQuery({
    queryKey: ['location', locationId],
    queryFn: () => getLocationById(Number(locationId)),
    enabled: !!locationId,
  });

  const result = queryGate(locationQuery);
  if (!result.ready) return result.gate;

  const [location] = result.data;

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
