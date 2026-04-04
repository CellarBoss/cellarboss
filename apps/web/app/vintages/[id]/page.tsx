"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Earth, Clock, Barrel } from "lucide-react";
import { getVintageById, deleteVintage } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { getBottlesByVintageId } from "@/lib/api/bottles";
import { getStorages } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { RelatedResourceSection } from "@/components/detail/RelatedResourceSection";
import { VintageBottleListItem } from "@/components/detail/VintageBottleListItem";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { DrinkingWindowDisplay } from "@/components/vintage/DrinkingWindowDisplay";
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
        <DetailCard heading="Wine" icon={Barrel}>
          <h3 className="text-lg font-semibold">
            {wine ? (
              <Link href={`/wines/${wine.id}`} className="hover:underline">
                {wine.name}
              </Link>
            ) : (
              "Unknown wine"
            )}
            <span className="text-muted-foreground ml-2">{yearDisplay}</span>
          </h3>
          {winemaker && (
            <DetailRow icon={User}>
              <Link
                href={`/winemakers/${winemaker.id}`}
                className="hover:underline text-primary"
              >
                {winemaker.name}
              </Link>
            </DetailRow>
          )}
          {(region || country) && (
            <DetailRow icon={Earth}>
              {[region?.name, country?.name].filter(Boolean).join(", ")}
            </DetailRow>
          )}
          <DetailRow icon={Clock}>
            <DrinkingWindowDisplay
              drinkFrom={vintage.drinkFrom}
              drinkUntil={vintage.drinkUntil}
            />
          </DetailRow>
        </DetailCard>

        <VintageImageGallery vintageId={vintageId} className="" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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

        <TastingNotesSection className="" vintageId={vintageId} />
      </div>
    </section>
  );
}
