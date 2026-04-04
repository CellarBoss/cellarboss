"use client";

import { useParams, useRouter } from "next/navigation";
import { Globe, MapPin } from "lucide-react";
import { getCountryById, deleteCountry } from "@/lib/api/countries";
import { getRegions } from "@/lib/api/regions";
import { getWines } from "@/lib/api/wines";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { RelatedResourceSection } from "@/components/detail/RelatedResourceSection";
import { RelatedResourceItem } from "@/components/detail/RelatedResourceItem";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewCountryPage() {
  const params = useParams();
  const router = useRouter();
  const countryId = Number(params.id);

  const countryQuery = useApiQuery({
    queryKey: ["country", countryId],
    queryFn: () => getCountryById(countryId),
    enabled: !!countryId,
  });

  const regionsQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: getWines,
  });

  const result = queryGate([countryQuery, regionsQuery, winesQuery]);
  if (!result.ready) return result.gate;

  const [country, allRegions, allWines] = result.data;

  const regions = allRegions
    .filter((r) => r.countryId === countryId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const wineCountByRegion = new Map<number, number>();
  for (const wine of allWines) {
    if (wine.regionId !== null) {
      wineCountByRegion.set(
        wine.regionId,
        (wineCountByRegion.get(wine.regionId) ?? 0) + 1,
      );
    }
  }

  return (
    <section>
      <PageHeader
        title={country.name}
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/countries/${countryId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteCountry(countryId);
                if (result.ok) router.push("/countries");
                return result.ok;
              }}
              itemDescription={country.name}
            />
          </>
        }
      />

      <DetailCard heading="Details" icon={Globe}>
        <h3 className="text-lg font-semibold">{country.name}</h3>
        <DetailRow icon={MapPin}>
          {regions.length} {regions.length === 1 ? "region" : "regions"}
        </DetailRow>
      </DetailCard>

      <RelatedResourceSection
        heading="Regions"
        count={regions.length}
        addHref={`/regions/new?countryId=${countryId}`}
        addLabel="Add region"
        emptyMessage="No regions yet"
      >
        {regions.map((region) => (
          <RelatedResourceItem
            key={region.id}
            href={`/regions/${region.id}`}
            icon={MapPin}
            badge={
              <Badge variant="secondary">
                {wineCountByRegion.get(region.id) ?? 0} wines
              </Badge>
            }
          >
            {region.name}
          </RelatedResourceItem>
        ))}
      </RelatedResourceSection>
    </section>
  );
}
