"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getWineById } from "@/lib/api/wines";
import { getWineGrapes } from "@/lib/api/winegrapes";
import { GenericCard } from "@/components/cards/GenericCard";
import { wineFields, WineFormData } from "@/lib/fields/wines";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function ViewWinePage() {
  const params = useParams();
  const wineId = Number(params.id);

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ['wine', wineId],
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

  const grapeIds = wineGrapesResult.data
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
