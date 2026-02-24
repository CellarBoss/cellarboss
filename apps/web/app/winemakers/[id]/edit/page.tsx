"use client";

import { useParams } from "next/navigation";
import { getWinemakerById } from "@/lib/api/winemakers";
import type { WineMaker } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { winemakerFields } from "@/lib/fields/winemakers";
import { updateWinemaker } from "@/lib/api/winemakers";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";

async function handleUpdate(
  winemaker: WineMaker,
): Promise<ApiResult<WineMaker>> {
  console.log("Update winemaker:", winemaker);

  try {
    return updateWinemaker(winemaker);
  } catch (err: unknown) {
    console.error("Update failed:", err);
    throw err;
  }
}

export default function EditWinemakerPage() {
  const params = useParams();
  const winemakerId = Number(params.id);

  const winemakerQuery = useApiQuery({
    queryKey: ["winemaker", winemakerId],
    queryFn: () => getWinemakerById(winemakerId),
    enabled: !!winemakerId,
  });

  const result = queryGate(winemakerQuery);
  if (!result.ready) return result.gate;

  const [winemaker] = result.data;

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
