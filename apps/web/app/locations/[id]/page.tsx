"use client";

import { useParams, useRouter } from "next/navigation";
import { MapPin, Refrigerator } from "lucide-react";
import { getLocationById, deleteLocation } from "@/lib/api/locations";
import { getStorages } from "@/lib/api/storages";
import { getBottles } from "@/lib/api/bottles";
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

export default function ViewLocationPage() {
  const params = useParams();
  const router = useRouter();
  const locationId = Number(params.id);

  const locationQuery = useApiQuery({
    queryKey: ["location", locationId],
    queryFn: () => getLocationById(locationId),
    enabled: !!locationId,
  });

  const storagesQuery = useApiQuery({
    queryKey: ["storages"],
    queryFn: getStorages,
  });

  const bottlesQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: getBottles,
  });

  const result = queryGate([locationQuery, storagesQuery, bottlesQuery]);
  if (!result.ready) return result.gate;

  const [location, allStorages, allBottles] = result.data;

  const storages = allStorages
    .filter((s) => s.locationId === locationId && s.parent === null)
    .sort((a, b) => a.name.localeCompare(b.name));

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
        title="Location Details"
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/locations/${locationId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteLocation(locationId);
                if (result.ok) router.push("/locations");
                return result.ok;
              }}
              itemDescription={location.name}
            />
          </>
        }
      />

      <DetailCard heading="Details" icon={MapPin}>
        <h3 className="text-lg font-semibold">{location.name}</h3>
        <DetailRow icon={Refrigerator}>
          {storages.length} {storages.length === 1 ? "storage" : "storages"}
        </DetailRow>
      </DetailCard>

      <RelatedResourceSection
        heading="Storages"
        count={storages.length}
        addHref={`/storages/new?locationId=${locationId}`}
        addLabel="Add storage"
        emptyMessage="No storages yet"
      >
        {storages.map((storage) => (
          <RelatedResourceItem
            key={storage.id}
            href={`/storages/${storage.id}`}
            icon={Refrigerator}
            badge={
              <Badge variant="secondary">
                {bottleCountByStorage.get(storage.id) ?? 0} bottles
              </Badge>
            }
          >
            {storage.name}
          </RelatedResourceItem>
        ))}
      </RelatedResourceSection>
    </section>
  );
}
