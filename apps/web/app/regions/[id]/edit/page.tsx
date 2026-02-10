"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import type { Region } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";
import { getRegionById, updateRegion } from "@/lib/api/regions";
import { regionFields } from "@/lib/fields/regions";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

async function handleUpdate(region: Region): Promise<ApiResult<Region>> {
  console.log("Update region:", region);

  try {
    return updateRegion(region);
  } catch (err: any) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditRegionPage() {
  const params = useParams();
  const regionId = Number(params.id);

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["region", regionId],
    queryFn: () => getRegionById(regionId),
    enabled: !!regionId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var region = queryResult.data;

  return (
    <section>
      <PageHeader title="Edit Region" />
      <GenericCard<Region>
        mode="edit"
        data={region}
        fields={regionFields}
        processSave={handleUpdate}
        redirectTo="/regions"
      />
    </section>
  );
}