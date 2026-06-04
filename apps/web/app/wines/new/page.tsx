"use client";

import type { Wine } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";

import { wineFields, WineFormData } from "@/lib/fields/wines";
import { createWine } from "@/lib/api/wines";
import { createWineGrape } from "@/lib/api/winegrapes";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(
  formData: WineFormData,
): Promise<ApiResult<WineFormData>> {
  const formValues = { ...formData };
  delete (formValues as Partial<WineFormData>).id;
  const { grapeIds, ...wineData } = formValues;

  const result = await createWine(wineData as Wine);
  if (!result.ok) return result;

  const newWine = result.data;

  // Create winegrape associations
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

export default function NewWinePage() {
  return (
    <section>
      <PageHeader title="New Wine" />
      <GenericCard<WineFormData>
        mode="create"
        fields={wineFields}
        processSave={handleCreate}
        redirectTo="/wines"
      />
    </section>
  );
}
