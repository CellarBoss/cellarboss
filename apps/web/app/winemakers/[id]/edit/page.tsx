"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { getWinemakerById } from "@/lib/api/winemakers";
import type { WineMaker } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { winemakerFields } from "@/lib/fields/winemakers";
import { updateWinemaker } from "@/lib/api/winemakers";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";

async function handleUpdate(winemaker: WineMaker): Promise<ApiResult<WineMaker>> {
  console.log("Update winemaker:", winemaker);

  try {
    return updateWinemaker(winemaker);
  } catch (err: any) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditWinemakerPage() {
  const params = useParams();
  const winemakerId = Number(params.id);

  const { data: queryResult, isLoading, error } = useQuery({
    queryKey: ["winemaker", winemakerId],
    queryFn: () => getWinemakerById(winemakerId),
    enabled: !!winemakerId,
  });

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorCard message={`An error occurred: ` + (error as any).message} />;
  if (!queryResult?.ok) return <ErrorCard message={`Error receiving data: ` + queryResult?.error.message } />;

  var winemaker = queryResult.data;

  return (
    <section>
      <PageHeader title="Edit Winemaker" />
      <GenericCard<WineMaker>
        mode="edit"
        data={winemaker}
        fields={winemakerFields}
        processSave={handleUpdate}
        redirectTo="/winemakers"
      />
    </section>
  );
}
