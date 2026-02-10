"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getGrapeById } from "@/lib/api/grapes";
import type { Grape } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { grapeFields } from "@/lib/fields/grapes";
import { updateGrape } from "@/lib/api/grapes";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

async function handleUpdate(grape: Grape): Promise<ApiResult<Grape>> {
  console.log("Update grape:", grape);

  try {
    return updateGrape(grape);
  } catch (err: any) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditGrapePage() {
  const params = useParams();
  const grapeId = Number(params.id);

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["grape", grapeId],
    queryFn: () => getGrapeById(grapeId),
    enabled: !!grapeId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var grape = queryResult.data;

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