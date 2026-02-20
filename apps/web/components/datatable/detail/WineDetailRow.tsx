"use client";

import type { Wine } from "@cellarboss/types";
import { getWinemakerById } from "@/lib/api/winemakers";
import { getGrapes } from "@/lib/api/grapes";
import { getWineGrapesByWineId } from "@/lib/api/winegrapes";
import { getRegionById } from "@/lib/api/regions";
import { getCountryById } from "@/lib/api/countries";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import { getVintagesByWineId, deleteVintage } from "@/lib/api/vintages";
import { Badge } from "@/components/ui/badge";
import { EditButton } from "@/components/buttons/EditButton";
import { DeleteButton } from "@/components/buttons/DeleteButton";
import { Earth, User, Grape, Wine as WineIcon, Check, Hourglass, AlertCircle } from "lucide-react";
import { WINE_TYPE_COLORS, WINE_TYPE_LABELS } from "@/lib/constants/wine-colouring";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { formatDrinkingWindow, formatDrinkingStatus } from "@/lib/functions/format";
import { BottleButton } from "@/components/buttons/BottleButton";

export default function WineDetailRow({ wine }: { wine: Wine }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const winemakerQuery = useApiQuery({
    queryKey: ["winemaker", wine.wineMakerId],
    queryFn: () => getWinemakerById(wine.wineMakerId),
  });

  const grapeQuery = useApiQuery({ queryKey: ["grapes"], queryFn: getGrapes });
  const wineGrapeQuery = useApiQuery({
    queryKey: ["winegrapes", wine.id],
    queryFn: () => getWineGrapesByWineId(wine.id),
  });

  const regionQuery = useApiQuery({
    queryKey: ["region", wine.regionId],
    queryFn: () => getRegionById(wine.regionId!),
    enabled: wine.regionId !== null,
  });

  const countryQuery = useApiQuery({
    queryKey: ["country", regionQuery.data?.countryId],
    queryFn: () => getCountryById(regionQuery.data!.countryId),
    enabled: regionQuery.isSuccess,
  });

  const vintageQuery = useApiQuery({
    queryKey: ["vintages", wine.id],
    queryFn: () => getVintagesByWineId(wine.id),
  });

  const result = queryGate(winemakerQuery, grapeQuery, wineGrapeQuery);
  if (!result.ready) return result.gate;

  const [winemaker, grapes, wineGrapes] = result.data;

  const region = regionQuery.data;
  const country = countryQuery.data;

  const currentYear = new Date().getFullYear();

  const grapeEntries = wineGrapes
    .map((wg) => {
      const grape = grapes.find((g) => g.id === wg.grapeId);
      return grape ? { id: grape.id, name: grape.name } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return (
    <div className="flex gap-4">
    <div className={`w-1 self-stretch rounded-full shrink-0 ${WINE_TYPE_COLORS[wine.type]}`} />
    <div className="grid grid-cols-[auto_1fr_1fr] gap-6 flex-1">
      <div className="flex items-center justify-center w-24 h-32 rounded-lg bg-muted" title={WINE_TYPE_LABELS[wine.type]}>
        <WineIcon className={`w-10 h-10`} />
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <Link href={`/wines/${wine.id}`} className="inline-flex items-center gap-1.5 font-bold text-xl hover:underline">
          {wine.name}
        </Link>
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3.5 w-5 shrink-0" />
          <Link href={`/winemakers/${winemaker.id}`} className="hover:underline">
            {winemaker.name}
          </Link>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Earth className="h-3.5 w-5 shrink-0" />
          {region ? (
            <Link href={`/regions/${region.id}`} className="hover:underline">
              {region.name}, {country?.name ?? "..."}
            </Link>
          ) : "\u2014"}
        </span>
        {grapeEntries.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Grape className="h-3.5 w-5 shrink-0" />
            {grapeEntries.map((grape) => (
              <Link key={grape.id} href={`/grapes/${grape.id}`}>
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {grape.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="text-sm">
        {vintageQuery.isLoading ? (
          <p className="mt-1 text-muted-foreground italic">Loading...</p>
        ) : vintageQuery.data && vintageQuery.data.length > 0 ? (
          <table className="mt-1 w-100 text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs">
                <th className="text-left font-medium py-1 pr-4">Vintage</th>
                <th className="text-left font-medium py-1 pr-4">Drinking Window</th>
                <th className="text-right font-medium py-1"></th>
              </tr>
            </thead>
            <tbody>
              {/* Custom sort to put NV at the end */}
              {[...vintageQuery.data].sort((a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity)).map((v) => (
                <tr key={v.id} className="border-t border-border/50">
                  <td className="py-1 pr-4">
                    <Link href={`/vintages/${v.id}`} className="hover:underline">
                      {v.year ?? "NV"}
                    </Link>
                  </td>
                  <td className="py-1 pr-4 text-muted-foreground">
                    <span className="flex items-center gap-2">
                    {(() => {
                      const status = formatDrinkingStatus(v.drinkFrom, v.drinkUntil, currentYear);
                      switch (status) {
                        case 'drinkable':
                          return <Check className="inline-block h-3.5 w-3.5 text-green-500" />;
                        case 'wait':
                          return <Hourglass className="inline-block h-3.5 w-3.5 text-yellow-500" />;
                        case 'past':
                          return <AlertCircle className="inline-block h-3.5 w-3.5 text-red-500" />;
                      }
                    })()}
                    {' '}
                    {formatDrinkingWindow(v.drinkFrom, v.drinkUntil)}
                    </span>
                  </td>
                  <td className="py-1 text-right">
                    <span className="inline-flex items-center gap-1">
                      <BottleButton onClick={async () => router.push(`/bottles/new?vintageId=${v.id}`)} />
                      <EditButton onEdit={async () => router.push(`/vintages/${v.id}/edit`)} />
                      <DeleteButton
                        itemDescription={`${v.year ?? "NV"} ${wine.name}`}
                        onDelete={async () => {
                          const result = await deleteVintage(v.id);
                          if (!result.ok) throw new Error(result.error.message);
                          queryClient.invalidateQueries({ queryKey: ["vintages", wine.id] });
                          return true;
                        }}
                      />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-1 text-muted-foreground italic">No vintages</p>
        )}
      </div>
    </div>
    </div>
  );
}
