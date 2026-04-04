"use client";

import { useParams, useRouter } from "next/navigation";
import { Grape, Wine } from "lucide-react";
import { getGrapeById, deleteGrape } from "@/lib/api/grapes";
import { getWines } from "@/lib/api/wines";
import { getWineGrapes } from "@/lib/api/winegrapes";
import { getWinemakers } from "@/lib/api/winemakers";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { RelatedResourceSection } from "@/components/detail/RelatedResourceSection";
import { WineListItem } from "@/components/detail/WineListItem";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewGrapePage() {
  const params = useParams();
  const router = useRouter();
  const grapeId = Number(params.id);

  const grapeQuery = useApiQuery({
    queryKey: ["grape", grapeId],
    queryFn: () => getGrapeById(grapeId),
    enabled: !!grapeId,
  });

  const wineGrapesQuery = useApiQuery({
    queryKey: ["winegrapes"],
    queryFn: getWineGrapes,
  });

  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: getWines,
  });

  const winemakersQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });

  const result = queryGate([
    grapeQuery,
    wineGrapesQuery,
    winesQuery,
    winemakersQuery,
  ]);
  if (!result.ready) return result.gate;

  const [grape, allWineGrapes, allWines, allWinemakers] = result.data;

  const wineIds = new Set(
    allWineGrapes.filter((wg) => wg.grapeId === grapeId).map((wg) => wg.wineId),
  );

  const wines = allWines
    .filter((w) => wineIds.has(w.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const winemakerMap = new Map(allWinemakers.map((wm) => [wm.id, wm]));

  return (
    <section>
      <PageHeader
        title={grape.name}
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/grapes/${grapeId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteGrape(grapeId);
                if (result.ok) router.push("/grapes");
                return result.ok;
              }}
              itemDescription={grape.name}
            />
          </>
        }
      />

      <DetailCard heading="Details" icon={Grape}>
        <h3 className="text-lg font-semibold">{grape.name}</h3>
        <DetailRow icon={Wine}>
          {wines.length} {wines.length === 1 ? "wine" : "wines"}
        </DetailRow>
      </DetailCard>

      <RelatedResourceSection
        heading="Wines"
        count={wines.length}
        emptyMessage="No wines use this grape yet"
      >
        {wines.map((wine) => (
          <WineListItem
            key={wine.id}
            wine={wine}
            secondaryText={winemakerMap.get(wine.wineMakerId)?.name ?? ""}
          />
        ))}
      </RelatedResourceSection>
    </section>
  );
}
