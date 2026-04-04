"use client";

import { useParams, useRouter } from "next/navigation";
import { User, Wine } from "lucide-react";
import { getWinemakerById, deleteWinemaker } from "@/lib/api/winemakers";
import { getWines } from "@/lib/api/wines";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { RelatedResourceSection } from "@/components/detail/RelatedResourceSection";
import { WineListItem } from "@/components/detail/WineListItem";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewWinemakerPage() {
  const params = useParams();
  const router = useRouter();
  const winemakerId = Number(params.id);

  const winemakerQuery = useApiQuery({
    queryKey: ["winemaker", winemakerId],
    queryFn: () => getWinemakerById(winemakerId),
    enabled: !!winemakerId,
  });

  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: getWines,
  });

  const regionsQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const countriesQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  const result = queryGate([
    winemakerQuery,
    winesQuery,
    regionsQuery,
    countriesQuery,
  ]);
  if (!result.ready) return result.gate;

  const [winemaker, allWines, allRegions, allCountries] = result.data;

  const wines = allWines
    .filter((w) => w.wineMakerId === winemakerId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const regionMap = new Map(allRegions.map((r) => [r.id, r]));
  const countryMap = new Map(allCountries.map((c) => [c.id, c]));

  function getRegionCountry(regionId: number | null): string {
    if (regionId === null) return "";
    const region = regionMap.get(regionId);
    if (!region) return "";
    const country = countryMap.get(region.countryId);
    return [region.name, country?.name].filter(Boolean).join(", ");
  }

  return (
    <section>
      <PageHeader
        title={winemaker.name}
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/winemakers/${winemakerId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteWinemaker(winemakerId);
                if (result.ok) router.push("/winemakers");
                return result.ok;
              }}
              itemDescription={winemaker.name}
            />
          </>
        }
      />

      <DetailCard heading="Details" icon={User}>
        <h3 className="text-lg font-semibold">{winemaker.name}</h3>
        <DetailRow icon={Wine}>
          {wines.length} {wines.length === 1 ? "wine" : "wines"}
        </DetailRow>
      </DetailCard>

      <RelatedResourceSection
        heading="Wines"
        count={wines.length}
        addHref={`/wines/new?winemakerId=${winemakerId}`}
        addLabel="Add wine"
        emptyMessage="No wines yet"
      >
        {wines.map((wine) => (
          <WineListItem
            key={wine.id}
            wine={wine}
            secondaryText={getRegionCountry(wine.regionId)}
          />
        ))}
      </RelatedResourceSection>
    </section>
  );
}
