"use client";

import { useParams } from "next/navigation";
import type { Region } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { getRegionById, updateRegion } from "@/lib/api/regions";
import { regionFields } from "@/lib/fields/regions";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(region: Region): Promise<ApiResult<Region>> {
  console.log("Update region:", region);

  try {
    return updateRegion(region);
  } catch (err: unknown) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditRegionPage() {
  const params = useParams();
  const regionId = Number(params.id);

  const regionQuery = useApiQuery({
    queryKey: ["region", regionId],
    queryFn: () => getRegionById(regionId),
    enabled: !!regionId,
  });

  const result = queryGate(regionQuery);
  if (!result.ready) return result.gate;

  const [region] = result.data;

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
