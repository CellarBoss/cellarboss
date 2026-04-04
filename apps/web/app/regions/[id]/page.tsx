"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Earth, Flag, Barrel } from "lucide-react";
import { getRegionById, deleteRegion } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { getWines } from "@/lib/api/wines";
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

export default function ViewRegionPage() {
  const params = useParams();
  const router = useRouter();
  const regionId = Number(params.id);

  const regionQuery = useApiQuery({
    queryKey: ["region", regionId],
    queryFn: () => getRegionById(regionId),
    enabled: !!regionId,
  });

  const countriesQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
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
    regionQuery,
    countriesQuery,
    winesQuery,
    winemakersQuery,
  ]);
  if (!result.ready) return result.gate;

  const [region, allCountries, allWines, allWinemakers] = result.data;

  const country = allCountries.find((c) => c.id === region.countryId);

  const wines = allWines
    .filter((w) => w.regionId === regionId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const winemakerMap = new Map(allWinemakers.map((wm) => [wm.id, wm]));

  return (
    <section>
      <PageHeader
        title="Region Details"
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/regions/${regionId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteRegion(regionId);
                if (result.ok) router.push("/regions");
                return result.ok;
              }}
              itemDescription={region.name}
            />
          </>
        }
      />

      <DetailCard heading="Details" icon={Flag}>
        <h3 className="text-lg font-semibold">{region.name}</h3>
        {country && (
          <DetailRow icon={Earth}>
            <Link
              href={`/countries/${country.id}`}
              className="hover:underline text-primary"
            >
              {country.name}
            </Link>
          </DetailRow>
        )}
        <DetailRow icon={Barrel}>
          {wines.length} {wines.length === 1 ? "wine" : "wines"}
        </DetailRow>
      </DetailCard>

      <RelatedResourceSection
        heading="Wines"
        count={wines.length}
        addHref={`/wines/new?regionId=${regionId}`}
        addLabel="Add wine"
        emptyMessage="No wines in this region yet"
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
