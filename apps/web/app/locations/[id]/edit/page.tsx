"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getLocationById } from "@/lib/api/locations";
import type { Location } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { locationFields } from "@/lib/fields/locations";
import { updateLocation } from "@/lib/api/locations";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

async function handleUpdate(location: Location): Promise<ApiResult<Location>> {
  console.log("Update location:", location);

  try {
    return updateLocation(location);
  } catch (err: any) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditLocationPage() {
  const params = useParams();
  const locationId = Number(params.id);

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationById(locationId),
    enabled: !!locationId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var location = queryResult.data;

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
