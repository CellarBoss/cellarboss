"use client";

import { useParams } from 'next/navigation';
import { getGrapeById } from "@/lib/api/grapes";
import type { Grape } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { grapeFields } from "@/lib/fields/grapes";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";

export default function ViewGrapePage() {
  const params = useParams();
  const grapeId = params.id;

  const grapeQuery = useApiQuery({
    queryKey: ['grape', grapeId],
    queryFn: () => getGrapeById(Number(grapeId)),
    enabled: !!grapeId,
  });

  const result = queryGate(grapeQuery);
  if (!result.ready) return result.gate;

  const [grape] = result.data;

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
