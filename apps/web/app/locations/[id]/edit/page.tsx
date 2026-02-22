"use client";

import { useParams } from 'next/navigation';
import { getLocationById } from "@/lib/api/locations";
import type { Location } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { locationFields } from "@/lib/fields/locations";
import { updateLocation } from "@/lib/api/locations";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(location: Location): Promise<ApiResult<Location>> {
  console.log("Update location:", location);

  try {
    return updateLocation(location);
  } catch (err: unknown) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditLocationPage() {
  const params = useParams();
  const locationId = Number(params.id);

  const locationQuery = useApiQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationById(locationId),
    enabled: !!locationId,
  });

  const result = queryGate(locationQuery);
  if (!result.ready) return result.gate;

  const [location] = result.data;

  return (
    <section>
      <PageHeader title="Edit Location" />
      <GenericCard<Location>
        mode="edit"
        data={location}
        fields={locationFields}
        processSave={handleUpdate}
        redirectTo="/locations"
      />
    </section>
  );
}
