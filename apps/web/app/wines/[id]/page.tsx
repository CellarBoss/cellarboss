"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Globe, Grape, Wine as WineIcon, BottleWine } from "lucide-react";
import { getWineById, deleteWine } from "@/lib/api/wines";
import { getWineGrapes } from "@/lib/api/winegrapes";
import { getVintagesByWineId } from "@/lib/api/vintages";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { getGrapes } from "@/lib/api/grapes";
import { getBottles } from "@/lib/api/bottles";
import { PageHeader } from "@/components/page/PageHeader";
import { DetailCard } from "@/components/detail/DetailCard";
import { DetailRow } from "@/components/detail/DetailRow";
import { RelatedResourceSection } from "@/components/detail/RelatedResourceSection";
import { RelatedResourceItem } from "@/components/detail/RelatedResourceItem";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { TastingNotesSection } from "@/components/tasting-notes/TastingNotesSection";
import { WineImageGallery } from "@/components/images/WineImageGallery";
import { DrinkingWindowDisplay } from "@/components/vintage/DrinkingWindowDisplay";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import { formatWineType } from "@/lib/functions/format";
import { WINE_TYPE_COLORS } from "@/lib/constants/wine-colouring";

export default function ViewWinePage() {
  const params = useParams();
  const router = useRouter();
  const wineId = Number(params.id);

  const wineQuery = useApiQuery({
    queryKey: ["wine", wineId],
    queryFn: () => getWineById(wineId),
    enabled: !!wineId,
  });

  const wineGrapesQuery = useApiQuery({
    queryKey: ["winegrapes"],
    queryFn: getWineGrapes,
  });

  const vintagesQuery = useApiQuery({
    queryKey: ["vintages", wineId],
    queryFn: () => getVintagesByWineId(wineId),
    enabled: !!wineId,
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

  const grapesQuery = useApiQuery({
    queryKey: ["grapes"],
    queryFn: getGrapes,
  });

  const bottlesQuery = useApiQuery({
    queryKey: ["bottles"],
    queryFn: getBottles,
  });

  const result = queryGate([
    wineQuery,
    wineGrapesQuery,
    vintagesQuery,
    winemakersQuery,
    regionsQuery,
    countriesQuery,
    grapesQuery,
    bottlesQuery,
  ]);
  if (!result.ready) return result.gate;

  const [
    wine,
    allWineGrapes,
    vintages,
    allWinemakers,
    allRegions,
    allCountries,
    allGrapes,
    allBottles,
  ] = result.data;

  const winemaker = allWinemakers.find((wm) => wm.id === wine.wineMakerId);
  const region = allRegions.find((r) => r.id === wine.regionId);
  const country = region
    ? allCountries.find((c) => c.id === region.countryId)
    : undefined;

  const grapeIds = allWineGrapes
    .filter((wg) => wg.wineId === wineId)
    .map((wg) => wg.grapeId);
  const grapes = allGrapes.filter((g) => grapeIds.includes(g.id));

  const sortedVintages = [...vintages].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );

  const vintageIds = new Set(vintages.map((v) => v.id));
  const bottleCountByVintage = new Map<number, number>();
  let totalStoredBottles = 0;
  for (const bottle of allBottles) {
    if (vintageIds.has(bottle.vintageId) && bottle.status === "stored") {
      bottleCountByVintage.set(
        bottle.vintageId,
        (bottleCountByVintage.get(bottle.vintageId) ?? 0) + 1,
      );
      totalStoredBottles++;
    }
  }

  return (
    <section>
      <PageHeader
        title="Wine Details"
        actions={
          <>
            <EditButton
              onEdit={async () => {
                router.push(`/wines/${wineId}/edit`);
              }}
            />
            <DeleteButton
              onDelete={async () => {
                const result = await deleteWine(wineId);
                if (result.ok) router.push("/wines");
                return result.ok;
              }}
              itemDescription={wine.name}
            />
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailCard heading="Details" icon={WineIcon}>
          <h3 className="text-lg font-semibold">{wine.name}</h3>
          <DetailRow icon={User}>
            {winemaker ? (
              <Link
                href={`/winemakers/${winemaker.id}`}
                className="hover:underline text-primary"
              >
                {winemaker.name}
              </Link>
            ) : (
              <span>Unknown winemaker</span>
            )}
          </DetailRow>
          {(region || country) && (
            <DetailRow icon={Globe}>
              {region && (
                <Link
                  href={`/regions/${region.id}`}
                  className="hover:underline text-primary"
                >
                  {region.name}
                </Link>
              )}
              {region && country && ", "}
              {country && (
                <Link
                  href={`/countries/${country.id}`}
                  className="hover:underline text-primary"
                >
                  {country.name}
                </Link>
              )}
            </DetailRow>
          )}
          {grapes.length > 0 && (
            <DetailRow icon={Grape}>
              <span className="flex flex-wrap gap-1">
                {grapes.map((g) => (
                  <Link key={g.id} href={`/grapes/${g.id}`}>
                    <Badge variant="secondary">{g.name}</Badge>
                  </Link>
                ))}
              </span>
            </DetailRow>
          )}
          <DetailRow icon={WineIcon}>
            <Badge
              className={`${WINE_TYPE_COLORS[wine.type]} text-white border-0`}
            >
              {formatWineType(wine.type)}
            </Badge>
          </DetailRow>
        </DetailCard>

        <WineImageGallery vintageIds={vintages.map((v) => v.id)} className="" />

        <RelatedResourceSection
          className=""
          heading="Vintages"
          count={sortedVintages.length}
          addHref={`/vintages/new?wineId=${wineId}`}
          addLabel="Add vintage"
          emptyMessage="No vintages yet"
        >
          {sortedVintages.map((vintage) => (
            <RelatedResourceItem
              key={vintage.id}
              href={`/vintages/${vintage.id}`}
              badge={
                <span className="flex items-center gap-3">
                  <DrinkingWindowDisplay
                    drinkFrom={vintage.drinkFrom}
                    drinkUntil={vintage.drinkUntil}
                  />
                  <Badge variant="secondary">
                    <BottleWine className="h-3 w-3 mr-1" />
                    {bottleCountByVintage.get(vintage.id) ?? 0}
                  </Badge>
                </span>
              }
            >
              <span className="font-medium">
                {vintage.year !== null ? vintage.year : "NV"}
              </span>
            </RelatedResourceItem>
          ))}
        </RelatedResourceSection>

        <TastingNotesSection className="" wineId={wineId} vintages={vintages} />
      </div>
    </section>
  );
}
