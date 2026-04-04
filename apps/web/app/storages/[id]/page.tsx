"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Warehouse,
  MapPin,
  FolderTree,
  BottleWine,
  ChevronRight,
} from "lucide-react";
import { getStorageById, deleteStorage, getStorages } from "@/lib/api/storages";
import { getLocations } from "@/lib/api/locations";
import { getBottles } from "@/lib/api/bottles";
import { getVintages } from "@/lib/api/vintages";
import { getWines } from "@/lib/api/wines";
import { getWinemakers } from "@/lib/api/winemakers";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { RelatedResourceSection } from "@/components/detail/RelatedResourceSection";
import { RelatedResourceItem } from "@/components/detail/RelatedResourceItem";
import { BottleListItem } from "@/components/detail/BottleListItem";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import { formatDrinkingStatus } from "@/lib/functions/format";
import type { Storage } from "@cellarboss/types";
import type { WineType } from "@cellarboss/validators/constants";

export default function ViewStoragePage() {
  const params = useParams();
  const router = useRouter();
  const storageId = Number(params.id);

  const storageQuery = useApiQuery({
    queryKey: ["storage", storageId],
    queryFn: () => getStorageById(storageId),
    enabled: !!storageId,
  });

  const allStoragesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });

  const locationsQuery = useApiQuery({
    queryKey: ["locations"],
    queryFn: getLocations,
  });

  const bottlesQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: getBottles,
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

  const result = queryGate([
    storageQuery,
    allStoragesQuery,
    locationsQuery,
    bottlesQuery,
    vintagesQuery,
    winesQuery,
    winemakersQuery,
  ]);
  if (!result.ready) return result.gate;

  const [
    storage,
    allStorages,
    allLocations,
    allBottles,
    allVintages,
    allWines,
    allWinemakers,
  ] = result.data;

  const storageMap = new Map(allStorages.map((s) => [s.id, s]));
  const vintageMap = new Map(allVintages.map((v) => [v.id, v]));
  const wineMap = new Map(allWines.map((w) => [w.id, w]));
  const winemakerMap = new Map(allWinemakers.map((m) => [m.id, m]));

  const location = storage.locationId
    ? allLocations.find((l) => l.id === storage.locationId)
    : undefined;

  // Build parent hierarchy
  const hierarchyPath: Storage[] = [];
  let current: Storage | undefined = storage;
  while (current?.parent != null) {
    const parent = storageMap.get(current.parent);
    if (parent) {
      hierarchyPath.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }

  const childStorages = allStorages
    .filter((s) => s.parent === storageId)
    .sort((a, b) => a.name.localeCompare(b.name));

  const storedBottles = allBottles.filter(
    (b) => b.storageId === storageId && b.status === "stored",
  );

  const currentYear = new Date().getFullYear();

  function getWineName(vintageId: number): string {
    const vintage = vintageMap.get(vintageId);
    if (!vintage) return "Unknown Wine";
    const wine = wineMap.get(vintage.wineId);
    return wine?.name ?? "Unknown Wine";
  }

  const sortedBottles = [...storedBottles].sort((a, b) =>
    getWineName(a.vintageId).localeCompare(getWineName(b.vintageId)),
  );

  // Count bottles per child storage
  const bottleCountByStorage = new Map<number, number>();
  for (const bottle of allBottles) {
    if (bottle.storageId !== null && bottle.status === "stored") {
      bottleCountByStorage.set(
        bottle.storageId,
        (bottleCountByStorage.get(bottle.storageId) ?? 0) + 1,
      );
    }
  }

  return (
    <section>
      <PageHeader
        title="Storage Details"
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/storages/${storageId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteStorage(storageId);
                if (result.ok) router.push("/storages");
                return result.ok;
              }}
              itemDescription={storage.name}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard heading="Details" icon={Warehouse}>
          {hierarchyPath.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap text-sm mb-1">
              {hierarchyPath.map((ancestor, i) => (
                <span key={ancestor.id} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                  <Link
                    href={`/storages/${ancestor.id}`}
                    className="hover:underline text-primary"
                  >
                    {ancestor.name}
                  </Link>
                </span>
              ))}
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
          <h3 className="text-lg font-semibold">{storage.name}</h3>
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
          {childStorages.length > 0 && (
            <DetailRow icon={FolderTree}>
              {childStorages.length}{" "}
              {childStorages.length === 1 ? "sub-storage" : "sub-storages"}
            </DetailRow>
          )}
          <DetailRow icon={BottleWine}>
            {storedBottles.length}{" "}
            {storedBottles.length === 1 ? "bottle" : "bottles"} stored
          </DetailRow>
        </DetailCard>

        <RelatedResourceSection
          className=""
          heading="Sub-storages"
          count={childStorages.length}
          addHref={`/storages/new?parentId=${storageId}`}
          addLabel="Add sub-storage"
          emptyMessage="No sub-storages"
        >
          {childStorages.map((child) => (
            <RelatedResourceItem
              key={child.id}
              href={`/storages/${child.id}`}
              icon={Warehouse}
              badge={
                <Badge variant="secondary">
                  {bottleCountByStorage.get(child.id) ?? 0} bottles
                </Badge>
              }
            >
              {child.name}
            </RelatedResourceItem>
          ))}
        </RelatedResourceSection>
      </div>

      <RelatedResourceSection
        heading="Bottles"
        count={storedBottles.length}
        emptyMessage="No bottles in this storage"
      >
        {sortedBottles.map((bottle) => {
          const vintage = vintageMap.get(bottle.vintageId);
          const wine = vintage ? wineMap.get(vintage.wineId) : undefined;
          const maker = wine ? winemakerMap.get(wine.wineMakerId) : undefined;
          const drinkingStatus = formatDrinkingStatus(
            vintage?.drinkFrom ?? null,
            vintage?.drinkUntil ?? null,
            currentYear,
          );
          return (
            <BottleListItem
              key={bottle.id}
              bottle={bottle}
              wineName={wine?.name ?? "Unknown Wine"}
              wineYear={vintage?.year != null ? String(vintage.year) : "NV"}
              winemakerName={maker?.name ?? ""}
              wineType={wine?.type as WineType | undefined}
              drinkingStatus={drinkingStatus}
            />
          );
        })}
      </RelatedResourceSection>
    </section>
  );
}
