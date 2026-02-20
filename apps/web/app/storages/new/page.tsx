"use client";

import type { Storage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { storageFields } from "@/lib/fields/storages";
import { createStorage } from "@/lib/api/storages";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";
import { expandNamePattern } from "@/lib/functions/strings";

async function handleCreate(storage: Storage): Promise<ApiResult<Storage>> {
  const names = expandNamePattern(storage.name);

  let lastResult: ApiResult<Storage> | null = null;
  for (const name of names) {
    lastResult = await createStorage({ ...storage, name });
    if (!lastResult.ok) return lastResult;
  }

  return lastResult as ApiResult<Storage>;
}

export default function NewStoragePage() {
  return (
    <section>
      <PageHeader title="New Storage"/>
      <p className="text-sm text-muted-foreground mb-4">
        Tip: Use [1-6] or [A-F] in the name to create multiple storages at once. Multiple ranges like [A-C][1-3] create all combinations.
      </p>
      <GenericCard<Storage>
        mode="create"
        fields={storageFields}
        processSave={handleCreate}
        redirectTo="/storages"
      />
    </section>

  );
}
