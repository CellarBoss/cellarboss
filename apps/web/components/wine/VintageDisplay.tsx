import { useApiQuery } from "@/hooks/use-api-query";
import { getVintageById } from "@/lib/api/vintages";
import { getWinemakerById } from "@/lib/api/winemakers";
import { getWineById } from "@/lib/api/wines";
import { queryGate } from "@/lib/functions/query-gate";
import Link from "next/link";

export function VintageDisplay({ vintageId }: { vintageId: number }) {
  const vintageQuery = useApiQuery({
    queryKey: ["vintage", vintageId],
    queryFn: () => getVintageById(vintageId),
  });

  const wineQuery = useApiQuery({
    queryKey: ["wine", vintageQuery.data?.wineId],
    queryFn: () => getWineById(vintageQuery.data!.wineId),
    enabled: !!vintageQuery.isFetched && !!vintageQuery.data?.wineId,
  });

  const wineMakerQuery = useApiQuery({
    queryKey: ["winemaker", wineQuery.data?.wineMakerId],
    queryFn: () => getWinemakerById(wineQuery.data!.wineMakerId),
    enabled: !!wineQuery.isFetched && !!wineQuery.data?.wineMakerId,
  });

  const gate = queryGate(vintageQuery, wineQuery, wineMakerQuery);
  if (!gate.ready) return <span className="text-muted-foreground">...</span>;

  return (
    <span>
      <Link href={`/wines/${wineQuery.data?.id}`}>{wineQuery.data?.name}</Link>&nbsp;
      <Link href={`/vintages/${vintageQuery.data?.id}`}>{vintageQuery.data?.year}</Link><br />
      <Link href={`/winemakers/${wineMakerQuery.data?.id}`} className="text-muted-foreground">{wineMakerQuery.data?.name}</Link>
    </span>
  );
}
