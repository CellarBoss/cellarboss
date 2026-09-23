"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Region } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { regionFields } from "@/lib/fields/regions";
import { createRegion } from "@/lib/api/regions";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { parseIdParam } from "@/lib/functions/strings";

async function handleCreate(region: Region): Promise<ApiResult<Region>> {
  console.log("Create region:", region);

  try {
    return createRegion(region);
  } catch (err: unknown) {
    console.error("Create failed:", err);
    throw err;
  }
}

function NewRegionForm() {
  const searchParams = useSearchParams();
  const countryId = parseIdParam(searchParams.get("countryId"));

  const defaultData = countryId
    ? ({
        id: 0,
        name: "",
        countryId,
      } as Region)
    : undefined;

  const redirectTo = countryId ? `/countries/${countryId}` : "/regions";

  return (
    <GenericCard<Region>
      mode="create"
      data={defaultData}
      fields={regionFields}
      processSave={handleCreate}
      redirectTo={redirectTo}
    />
  );
}

export default function NewRegionPage() {
  return (
    <section>
      <PageHeader title="New Region" />
      <Suspense>
        <NewRegionForm />
      </Suspense>
    </section>
  );
}
