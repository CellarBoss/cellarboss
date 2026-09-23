"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Wine } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";

import { wineFields, WineFormData } from "@/lib/fields/wines";
import { createWine } from "@/lib/api/wines";
import { createWineGrape } from "@/lib/api/winegrapes";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { parseIdParam } from "@/lib/functions/strings";

async function handleCreate(formData: any): Promise<ApiResult<WineFormData>> {
  const { grapeIds, ...wineData } = formData;

  const result = await createWine(wineData as Wine);
  if (!result.ok) return result;

  const newWine = result.data;

  // Create winegrape associations
  const grapeIdList: string[] = Array.isArray(grapeIds) ? grapeIds : [];
  for (const grapeId of grapeIdList) {
    const grapeResult = await createWineGrape({
      wineId: newWine.id,
      grapeId: Number(grapeId),
    });
    if (!grapeResult.ok) {
      return { ok: false, error: grapeResult.error };
    }
  }

  return { ok: true, data: { ...newWine, grapeIds: grapeIdList.map(Number) } };
}

function NewWineForm() {
  const searchParams = useSearchParams();
  const winemakerId = parseIdParam(searchParams.get("winemakerId"));
  const regionId = parseIdParam(searchParams.get("regionId"));

  const defaultData =
    winemakerId || regionId
      ? ({
          id: 0,
          name: "",
          type: "" as WineFormData["type"],
          wineMakerId: winemakerId ?? 0,
          regionId,
          grapeIds: [],
        } as WineFormData)
      : undefined;

  const redirectTo = winemakerId
    ? `/winemakers/${winemakerId}`
    : regionId
      ? `/regions/${regionId}`
      : "/wines";

  return (
    <GenericCard<WineFormData>
      mode="create"
      data={defaultData}
      fields={wineFields}
      processSave={handleCreate}
      redirectTo={redirectTo}
    />
  );
}

export default function NewWinePage() {
  return (
    <section>
      <PageHeader title="New Wine" />
      <Suspense>
        <NewWineForm />
      </Suspense>
    </section>
  );
}
