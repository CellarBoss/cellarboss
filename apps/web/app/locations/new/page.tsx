"use client";

import type { Location } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { locationFields } from "@/lib/fields/locations";
import { createLocation } from "@/lib/api/locations";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(location: Location): Promise<ApiResult<Location>> {
  console.log("Create location:", location);

  try {
    return createLocation(location);
  } catch (err: unknown) {
    console.error("Create failed:", err);
    throw err;
  }
}

export default function NewLocationPage() {
  return (
    <section>
      <PageHeader title="New Location"/>
      <GenericCard<Location>
        mode="create"
        fields={locationFields}
        processSave={handleCreate}
        redirectTo="/locations"
      />
    </section>

  );
}
