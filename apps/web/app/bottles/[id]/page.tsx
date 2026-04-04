"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Earth,
  Clock,
  Barrel,
  CircleDot,
  Calendar,
  DollarSign,
  Refrigerator,
  MapPin,
  ChevronRight,
  BottleWine,
} from "lucide-react";
import { getBottleById, deleteBottle, updateBottle } from "@/lib/api/bottles";
import { getVintages } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { getStorages } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { ChangeStatusButton } from "@/components/buttons/ChangeStatusButton";
import { MoveBottleButton } from "@/components/buttons/MoveBottleButton";
import { DrinkingWindowDisplay } from "@/components/vintage/DrinkingWindowDisplay";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import {
  formatStatus,
  formatBottleSize,
  formatDate,
  formatPrice,
} from "@/lib/functions/format";
import { useSettingsContext } from "@/contexts/settings-context";
import { useQueryClient } from "@tanstack/react-query";

export default function ViewBottlePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bottleId = Number(params.id);
  const settings = useSettingsContext();
  const dateFormat = settings.get("dateFormat") ?? "yyyy-MM-dd";
  const currency = settings.get("currency") ?? "GBP";

  const bottleQuery = useApiQuery({
    queryKey: ["bottle", bottleId],
    queryFn: () => getBottleById(bottleId),
    enabled: !!bottleId,
  });

  const vintagesQuery = useApiQuery({
    queryKey: ["vintages"],
    queryFn: getVintages,
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

  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });

  const locationsQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const result = queryGate([
    bottleQuery,
    vintagesQuery,
    winesQuery,
    winemakersQuery,
    regionsQuery,
    countriesQuery,
    storagesQuery,
    locationsQuery,
  ]);
  if (!result.ready) return result.gate;

  const [
    bottle,
    allVintages,
    allWines,
    allWinemakers,
    allRegions,
    allCountries,
    allStorages,
    allLocations,
  ] = result.data;

  const vintage = allVintages.find((v) => v.id === bottle.vintageId);
  const wine = vintage
    ? allWines.find((w) => w.id === vintage.wineId)
    : undefined;
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

  // Build storage hierarchy path
  function getStorageHierarchy(): Array<{ id: number; name: string }> {
    if (bottle.storageId === null) return [];
    const path: Array<{ id: number; name: string }> = [];
    let current = storageMap.get(bottle.storageId);
    while (current) {
      path.unshift({ id: current.id, name: current.name });
      current =
        current.parent !== null ? storageMap.get(current.parent) : undefined;
    }
    return path;
  }

  const storagePath = getStorageHierarchy();
  const storage = bottle.storageId
    ? storageMap.get(bottle.storageId)
    : undefined;
  const location = storage?.locationId
    ? allLocations.find((l) => l.id === storage.locationId)
    : undefined;

  const yearDisplay = vintage?.year !== null ? String(vintage?.year) : "NV";
  const title = `Bottle #${bottle.id}`;

  return (
    <section>
      <PageHeader
        title="Bottle Details"
        actions={
          <>
            <ChangeStatusButton
              currentStatus={bottle.status}
              onChangeStatus={async (newStatus) => {
                await updateBottle({ ...bottle, status: newStatus });
                queryClient.invalidateQueries({
                  queryKey: ["bottle", bottleId],
                });
              }}
            />
            <MoveBottleButton
              storages={allStorages}
              currentStorageId={bottle.storageId}
              onMove={async (newStorageId) => {
                await updateBottle({ ...bottle, storageId: newStorageId });
                queryClient.invalidateQueries({
                  queryKey: ["bottle", bottleId],
                });
              }}
            />
            <EditButton
              onEdit={async () => {
                router.push(`/bottles/${bottleId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteBottle(bottleId);
                if (result.ok) router.push("/bottles");
                return result.ok;
              }}
              itemDescription={title}
            />
          </>
        }
      />

      <DetailCard heading="Wine" icon={Barrel}>
        <h3 className="text-lg font-semibold">
          {wine ? (
            <Link href={`/wines/${wine.id}`} className="hover:underline">
              {wine.name}
            </Link>
          ) : (
            "Unknown wine"
          )}
          {vintage && (
            <Link
              href={`/vintages/${vintage.id}`}
              className="text-muted-foreground ml-2 hover:underline"
            >
              {yearDisplay}
            </Link>
          )}
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
        {vintage && (
          <DetailRow icon={Clock}>
            <DrinkingWindowDisplay
              drinkFrom={vintage.drinkFrom}
              drinkUntil={vintage.drinkUntil}
            />
          </DetailRow>
        )}
      </DetailCard>

      <div className="mt-4">
        <DetailCard heading="Bottle" icon={BottleWine}>
          <DetailRow icon={CircleDot}>
            <Badge variant="secondary">{formatStatus(bottle.status)}</Badge>
          </DetailRow>
          <DetailRow icon={BottleWine}>
            {formatBottleSize(bottle.size)}
          </DetailRow>
          <DetailRow icon={Calendar}>
            {bottle.purchaseDate
              ? formatDate(bottle.purchaseDate, String(dateFormat))
              : "-"}
          </DetailRow>
          <DetailRow icon={DollarSign}>
            {bottle.purchasePrice > 0
              ? formatPrice(bottle.purchasePrice, String(currency))
              : "-"}
          </DetailRow>
        </DetailCard>
      </div>

      {storagePath.length > 0 && (
        <div className="mt-4">
          <DetailCard heading="Storage" icon={Refrigerator}>
            <div className="flex items-center gap-1 flex-wrap text-sm">
              {storagePath.map((segment, i) => (
                <span key={segment.id} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Link
                    href={`/storages/${segment.id}`}
                    className="hover:underline text-primary"
                  >
                    {segment.name}
                  </Link>
                </span>
              ))}
            </div>
            {location && (
              <DetailRow icon={MapPin}>
                <Link
                  href={`/locations/${location.id}`}
                  className="hover:underline text-primary"
                >
                  {location.name}
                </Link>
              </DetailRow>
            )}
          </DetailCard>
        </div>
      )}
    </section>
  );
}
