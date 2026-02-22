"use client";

import type { Region } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { regionFields } from "@/lib/fields/regions";
import { createRegion } from "@/lib/api/regions";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(region: Region): Promise<ApiResult<Region>> {
  console.log("Create region:", region);

  try {
    return createRegion(region);
  } catch (err: unknown) {
    console.error("Create failed:", err);
    throw err;
  }
}

export default function NewRegionPage() {
  return (
    <section>
      <PageHeader title="New Region"/>
      <GenericCard<Region>
        mode="create"
        fields={regionFields}
        processSave={handleCreate}
        redirectTo="/regions"
      />
    </section>
  );
}