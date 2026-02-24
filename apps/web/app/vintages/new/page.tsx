"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Vintage, CreateVintage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { vintageFields } from "@/lib/fields/vintages";
import { createVintage } from "@/lib/api/vintages";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(
  vintage: CreateVintage,
): Promise<ApiResult<Vintage>> {
  return createVintage(vintage);
}

function NewVintageForm() {
  const searchParams = useSearchParams();
  const wineId = searchParams.get("wineId");

  const defaultData = wineId
    ? ({
        id: 0,
        year: null,
        wineId: Number(wineId),
        drinkFrom: null,
        drinkUntil: null,
      } as Vintage)
    : undefined;

  return (
    <GenericCard<Vintage>
      mode="create"
      data={defaultData}
      fields={vintageFields}
      processSave={handleCreate}
      redirectTo="/wines"
    />
  );
}

export default function NewVintagePage() {
  return (
    <section>
      <PageHeader title="New Vintage" />
      <Suspense>
        <NewVintageForm />
      </Suspense>
    </section>
  );
}
