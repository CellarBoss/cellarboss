"use client";

import { useParams, useRouter } from "next/navigation";
import { getVintageById, deleteVintage } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { getBottlesByVintageId } from "@/lib/api/bottles";
import { getStorages } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import { PageHeader } from "@/components/page/PageHeader";
import { RelatedResourceSection } from "@/components/detail/RelatedResourceSection";
import { VintageBottleListItem } from "@/components/detail/VintageBottleListItem";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { WineDetailCard } from "@/components/detail/WineDetailCard";
import { TastingNotesSection } from "@/components/tasting-notes/TastingNotesSection";
import { VintageImageGallery } from "@/components/images/VintageImageGallery";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import type { WineType } from "@cellarboss/validators/constants";

export default function ViewVintagePage() {
  const params = useParams();
  const router = useRouter();
  const vintageId = Number(params.id);

  const vintageQuery = useApiQuery({
    queryKey: ["vintage", vintageId],
    queryFn: () => getVintageById(vintageId),
    enabled: !!vintageId,
  });

  const winesQuery = useApiQuery({
    queryKey: ["wines"],
    queryFn: getWines,
  });

  const winemakersQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });

  const regionsQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });

  const countriesQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });

  const bottlesQuery = useApiQuery({
    queryKey: ["bottles", "vintage", vintageId],
    queryFn: () => getBottlesByVintageId(vintageId),
    enabled: !!vintageId,
  });

  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });

  const locationsQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const result = queryGate([
    vintageQuery,
    winesQuery,
    winemakersQuery,
    regionsQuery,
    countriesQuery,
    bottlesQuery,
    storagesQuery,
    locationsQuery,
  ]);
  if (!result.ready) return result.gate;

  const [
    vintage,
    allWines,
    allWinemakers,
    allRegions,
    allCountries,
    bottles,
    allStorages,
    allLocations,
  ] = result.data;

  const wine = allWines.find((w) => w.id === vintage.wineId);
  const winemaker = wine
    ? allWinemakers.find((wm) => wm.id === wine.wineMakerId)
    : undefined;
  const region = wine?.regionId
    ? allRegions.find((r) => r.id === wine.regionId)
    : undefined;
  const country = region
    ? allCountries.find((c) => c.id === region.countryId)
    : undefined;

  const storageMap = new Map(allStorages.map((s) => [s.id, s]));
  const locationMap = new Map(allLocations.map((l) => [l.id, l]));

  function getStoragePath(storageId: number | null): string {
    if (storageId === null) return "";
    const parts: string[] = [];
    let current = storageMap.get(storageId);
    while (current) {
      parts.unshift(current.name);
      current =
        current.parent !== null ? storageMap.get(current.parent) : undefined;
    }
    return parts.join(" > ");
  }

  const sortedBottles = [...bottles].sort((a, b) => {
    if (a.status === "stored" && b.status !== "stored") return -1;
    if (a.status !== "stored" && b.status === "stored") return 1;
    return 0;
  });

  const yearDisplay = vintage.year !== null ? String(vintage.year) : "NV";
  const title = wine ? `${wine.name} ${yearDisplay}` : yearDisplay;

  return (
    <section>
      <PageHeader
        title="Vintage Details"
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/vintages/${vintageId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteVintage(vintageId);
                if (result.ok) router.push("/vintages");
                return result.ok;
              }}
              itemDescription={title}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-6">
          <WineDetailCard
            wine={wine}
            vintage={vintage}
            winemaker={winemaker}
            region={region}
            country={country}
          />

          <RelatedResourceSection
            className=""
            heading="Bottles"
            count={bottles.length}
            addHref={`/bottles/new?vintageId=${vintageId}`}
            addLabel="Add bottle"
            emptyMessage="No bottles yet"
          >
            {sortedBottles.map((bottle) => {
              const storage = bottle.storageId
                ? storageMap.get(bottle.storageId)
                : undefined;
              const location = storage?.locationId
                ? locationMap.get(storage.locationId)
                : undefined;
              return (
                <VintageBottleListItem
                  key={bottle.id}
                  bottle={bottle}
                  wineType={wine?.type as WineType | undefined}
                  locationName={location?.name}
                  storagePath={getStoragePath(bottle.storageId)}
                />
              );
            })}
          </RelatedResourceSection>
        </div>

        <div className="flex flex-col gap-6">
          <VintageImageGallery vintageId={vintageId} className="" />
          <TastingNotesSection className="" vintageId={vintageId} />
        </div>
      </div>
    </section>
  );
}
