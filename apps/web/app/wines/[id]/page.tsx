"use client";

import { useParams } from 'next/navigation';
import { getWineById } from "@/lib/api/wines";
import { getWineGrapes } from "@/lib/api/winegrapes";
import { GenericCard } from "@/components/cards/GenericCard";
import { wineFields, WineFormData } from "@/lib/fields/wines";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewWinePage() {
  const params = useParams();
  const wineId = Number(params.id);

  const wineQuery = useApiQuery({
    queryKey: ['wine', wineId],
    queryFn: () => getWineById(wineId),
    enabled: !!wineId,
  });

  const wineGrapesQuery = useApiQuery({
    queryKey: ['winegrapes'],
    queryFn: getWineGrapes,
  });

  const result = queryGate(wineQuery, wineGrapesQuery);
  if (!result.ready) return result.gate;

  const [wine, wineGrapesList] = result.data;

  const grapeIds = wineGrapesList
    .filter((wg) => wg.wineId === wineId)
    .map((wg) => wg.grapeId);

  const wineFormData: WineFormData = {
    ...wine,
    grapeIds,
  };

  return (
    <section>
      <PageHeader title={`View Wine - ${wine.name}`} />
      <GenericCard<WineFormData>
        mode="view"
        data={wineFormData}
        fields={wineFields}
      />
    </section>
  );
}
