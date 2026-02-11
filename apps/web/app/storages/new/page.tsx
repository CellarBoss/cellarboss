"use client";

import type { Storage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { storageFields } from "@/lib/fields/storages";
import { createStorage } from "@/lib/api/storages";
import { ApiResult } from "@/lib/api/frontend";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(storage: Storage): Promise<ApiResult<Storage>> {
  console.log("Create storage:", storage);

  try {
    return createStorage(storage);
  } catch (err: any) {
    console.error("Create failed:", err);
    throw err;
  }
}

export default function NewStoragePage() {
  return (
    <section>
      <PageHeader title="New Storage"/>
      <GenericCard<Storage>
        mode="create"
        fields={storageFields}
        processSave={handleCreate}
        redirectTo="/storages"
      />
    </section>

  );
}
