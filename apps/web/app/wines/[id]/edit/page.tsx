"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getWineById, updateWine } from "@/lib/api/wines";
import { getWineGrapes, createWineGrape, deleteWineGrape } from "@/lib/api/winegrapes";
import type { Wine, WineGrape } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { wineFields, WineFormData } from "@/lib/fields/wines";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function EditWinePage() {
  const params = useParams();
  const wineId = Number(params.id);

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["wine", wineId],
    queryFn: () => getWineById(wineId),
    enabled: !!wineId,
  });

  const { data: wineGrapesResult, isLoading: wgLoading } = useQuery({
    queryKey: ['winegrapes'],
    queryFn: getWineGrapes,
  });

  if (isLoading || wgLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message} />;
  if (!wineGrapesResult?.ok) return <ErrorCard message={`Error receiving data: ` + wineGrapesResult?.error.message} />;

  var wine = queryResult.data;

  const currentWineGrapes = wineGrapesResult.data.filter((wg: WineGrape) => wg.wineId === wineId);
  const currentGrapeIds = currentWineGrapes.map((wg: WineGrape) => wg.grapeId);

  const wineFormData: WineFormData = {
    ...wine,
    grapeIds: currentGrapeIds,
  };

  async function handleUpdate(formData: any): Promise<ApiResult<WineFormData>> {
    const { grapeIds, ...wineData } = formData;

    const result = await updateWine(wineData as Wine);
    if (!result.ok) return result;

    // Sync grape associations
    const newGrapeIds: number[] = Array.isArray(grapeIds)
      ? grapeIds.map((id: string) => Number(id))
      : [];

    // Delete removed grapes
    for (const wg of currentWineGrapes) {
      if (!newGrapeIds.includes(wg.grapeId)) {
        const delResult = await deleteWineGrape(wg.id);
        if (!delResult.ok) {
          return { ok: false, error: delResult.error };
        }
      }
    }

    // Add new grapes
    for (const grapeId of newGrapeIds) {
      if (!currentGrapeIds.includes(grapeId)) {
        const createResult = await createWineGrape({
          wineId: wineId,
          grapeId: grapeId,
        });
        if (!createResult.ok) {
          return { ok: false, error: createResult.error };
        }
      }
    }

    return { ok: true, data: { ...result.data, grapeIds: newGrapeIds } };
  }

  return (
    <section>
      <PageHeader title="Edit Wine" />
      <GenericCard<WineFormData>
        mode="edit"
        data={wineFormData}
        fields={wineFields}
        processSave={handleUpdate}
        redirectTo="/wines"
      />
    </section>
  );
}
