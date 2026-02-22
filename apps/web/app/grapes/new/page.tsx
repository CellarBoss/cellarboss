"use client";

import type { Grape } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { grapeFields } from "@/lib/fields/grapes";
import { createGrape } from "@/lib/api/grapes";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(grape: Grape): Promise<ApiResult<Grape>> {
  console.log("Create grape:", grape);

  try {
    return createGrape(grape);
  } catch (err: unknown) {
    console.error("Create failed:", err);
    throw err;
  }
}

export default function NewGrapePage() {
  return (
    <section>
      <PageHeader title="New Grape"/>
      <GenericCard<Grape>
        mode="create"
        fields={grapeFields}
        processSave={handleCreate}
        redirectTo="/grapes"
      />
    </section>
      
  );
}