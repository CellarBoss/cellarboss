"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GenericCard } from "@/components/cards/GenericCard";

import { wineFields, WineFormData } from "@/lib/fields/wines";
import { createWine } from "@/lib/api/wines";
import { createWineGrape } from "@/lib/api/winegrapes";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { parseIdParam } from "@/lib/functions/strings";

async function handleCreate(
  formData: WineFormData,
): Promise<ApiResult<WineFormData>> {
  const { grapeIds, ...wineData } = formData;

  const result = await createWine(wineData);
  if (!result.ok) return result;

  const newWine = result.data;

  // Create winegrape associations
  // The form holds grape IDs as strings; normalise them to numbers.
  const grapeIdList = Array.isArray(grapeIds) ? grapeIds.map(Number) : [];
  for (const grapeId of grapeIdList) {
    const grapeResult = await createWineGrape({
      wineId: newWine.id,
      grapeId,
    });
    if (!grapeResult.ok) {
      return { ok: false, error: grapeResult.error };
    }
  }

  return { ok: true, data: { ...newWine, grapeIds: grapeIdList } };
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
