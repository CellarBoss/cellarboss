"use client";

import { useParams } from "next/navigation";
import type { Bottle } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { bottleFields } from "@/lib/fields/bottles";
import { getBottleById } from "@/lib/api/bottles";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewBottlePage() {
  const params = useParams();
  const bottleId = Number(params.id);

  const bottleQuery = useApiQuery({
    queryKey: ["bottle", bottleId],
    queryFn: () => getBottleById(bottleId),
    enabled: !!bottleId,
  });

  const result = queryGate([bottleQuery]);
  if (!result.ready) return result.gate;

  const [bottle] = result.data;

  return (
    <section>
      <PageHeader title={`Bottle #${bottle.id}`} />
      <GenericCard<Bottle> mode="view" data={bottle} fields={bottleFields} />
    </section>
  );
}
