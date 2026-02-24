"use client";

import { useParams } from "next/navigation";
import { getRegionById } from "@/lib/api/regions";
import type { Region } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { PageHeader } from "@/components/page/PageHeader";
import { regionFields } from "@/lib/fields/regions";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewCountryPage() {
  const params = useParams();
  const regionId = params.id;

  const regionQuery = useApiQuery({
    queryKey: ["region", regionId],
    queryFn: () => getRegionById(Number(regionId)),
    enabled: !!regionId,
  });

  const result = queryGate(regionQuery);
  if (!result.ready) return result.gate;

  const [region] = result.data;

  return (
    <section>
      <PageHeader title={`View Region - ${region.name}`} />
      <GenericCard<Region> mode="view" data={region} fields={regionFields} />
    </section>
  );
}
