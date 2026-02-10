"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getWinemakerById } from "@/lib/api/winemakers";
import type { WineMaker } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { winemakerFields } from "@/lib/fields/winemakers";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

export default function ViewWinemakerPage() {
  const params = useParams();
  const winemakerId = params.id;

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ['winemaker', winemakerId],
    queryFn: () => getWinemakerById(Number(winemakerId)),
    enabled: !!winemakerId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var winemaker = queryResult.data;

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
