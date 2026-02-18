"use client";

import { useParams } from "next/navigation";
import type { Bottle } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { bottleFields } from "@/lib/fields/bottles";
import { getBottleById, updateBottle } from "@/lib/api/bottles";
import type { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";

async function handleUpdate(bottle: Bottle): Promise<ApiResult<Bottle>> {
  return updateBottle(bottle);
}

export default function EditBottlePage() {
  const params = useParams();
  const bottleId = Number(params.id);

  const bottleQuery = useApiQuery({
    queryKey: ["bottle", bottleId],
    queryFn: () => getBottleById(bottleId),
    enabled: !!bottleId,
  });

  const result = queryGate(bottleQuery);
  if (!result.ready) return result.gate;

  const [bottle] = result.data;

  return (
    <section>
      <PageHeader title="Edit Bottle" />
      <GenericCard<Bottle>
        mode="edit"
        data={bottle}
        fields={bottleFields}
        processSave={handleUpdate}
        redirectTo={`/bottles/${bottleId}`}
      />
    </section>
  );
}
