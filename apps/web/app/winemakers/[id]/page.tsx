"use client";

import { useParams } from "next/navigation";
import { getWinemakerById } from "@/lib/api/winemakers";
import type { WineMaker } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { winemakerFields } from "@/lib/fields/winemakers";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

export default function ViewWinemakerPage() {
  const params = useParams();
  const winemakerId = params.id;

  const winemakerQuery = useApiQuery({
    queryKey: ["winemaker", winemakerId],
    queryFn: () => getWinemakerById(Number(winemakerId)),
    enabled: !!winemakerId,
  });

  const result = queryGate(winemakerQuery);
  if (!result.ready) return result.gate;

  const [winemaker] = result.data;

  return (
    <section>
      <PageHeader title={`View Winemaker - ${winemaker.name}`} />
      <GenericCard<WineMaker>
        mode="view"
        data={winemaker}
        fields={winemakerFields}
      />
    </section>
  );
}
