"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Bottle, CreateBottle } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { bottleCreateFields, type BottleFormData } from "@/lib/fields/bottles";
import { createBottle } from "@/lib/api/bottles";
import type { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(
  data: BottleFormData,
): Promise<ApiResult<BottleFormData>> {
  const quantity = Math.max(1, Number(data.quantity) || 1);
  const bottleData: CreateBottle = {
    purchaseDate: data.purchaseDate,
    purchasePrice: Number(data.purchasePrice),
    vintageId: Number(data.vintageId),
    storageId: data.storageId ? Number(data.storageId) : null,
    status: data.status,
  };

  let lastResult: ApiResult<Bottle> | null = null;
  for (let i = 0; i < quantity; i++) {
    lastResult = await createBottle(bottleData);
    if (!lastResult.ok)
      return lastResult as unknown as ApiResult<BottleFormData>;
  }
  return lastResult as unknown as ApiResult<BottleFormData>;
}

function NewBottleForm() {
  const searchParams = useSearchParams();
  const vintageId = searchParams.get("vintageId");
  const today = new Date().toISOString().split("T")[0];

  const defaultData: BottleFormData = {
    id: 0,
    purchaseDate: today,
    purchasePrice: 0,
    vintageId: vintageId ? Number(vintageId) : 0,
    storageId: null,
    status: "ordered",
    quantity: 1,
  };

  return (
    <GenericCard<BottleFormData>
      mode="create"
      data={defaultData}
      fields={bottleCreateFields}
      processSave={handleCreate}
      redirectTo="/bottles"
    />
  );
}

export default function NewBottlePage() {
  return (
    <section>
      <PageHeader title="New Bottle" />
      <Suspense>
        <NewBottleForm />
      </Suspense>
    </section>
  );
}
