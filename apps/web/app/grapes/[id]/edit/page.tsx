"use client";

import { useParams } from 'next/navigation';
import { getGrapeById } from "@/lib/api/grapes";
import type { Grape } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { grapeFields } from "@/lib/fields/grapes";
import { updateGrape } from "@/lib/api/grapes";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(grape: Grape): Promise<ApiResult<Grape>> {
  console.log("Update grape:", grape);

  try {
    return updateGrape(grape);
  } catch (err: unknown) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditGrapePage() {
  const params = useParams();
  const grapeId = Number(params.id);

  const grapeQuery = useApiQuery({
    queryKey: ["grape", grapeId],
    queryFn: () => getGrapeById(grapeId),
    enabled: !!grapeId,
  });

  const result = queryGate(grapeQuery);
  if (!result.ready) return result.gate;

  const [grape] = result.data;

  return (
    <section>
      <PageHeader title="Edit Grape" />
      <GenericCard<Grape>
        mode="edit"
        data={grape}
        fields={grapeFields}
        processSave={handleUpdate}
        redirectTo="/grapes"
      />
    </section>
  );
}