"use client";

import { useParams } from "next/navigation";
import type { Vintage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { getVintageById, updateVintage } from "@/lib/api/vintages";
import { vintageFields } from "@/lib/fields/vintages";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(vintage: Vintage): Promise<ApiResult<Vintage>> {
  return updateVintage(vintage);
}

export default function EditVintagePage() {
  const params = useParams();
  const vintageId = Number(params.id);

  const vintageQuery = useApiQuery({
    queryKey: ["vintage", vintageId],
    queryFn: () => getVintageById(vintageId),
    enabled: !!vintageId,
  });

  const result = queryGate(vintageQuery);
  if (!result.ready) return result.gate;

  const [vintage] = result.data;

  return (
    <section>
      <PageHeader title="Edit Vintage" />
      <GenericCard<Vintage>
        mode="edit"
        data={vintage}
        fields={vintageFields}
        processSave={handleUpdate}
        redirectTo={`/vintages/${vintageId}`}
      />
    </section>
  );
}
