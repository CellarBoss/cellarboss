"use client";

import type { WineMaker } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { winemakerFields } from "@/lib/fields/winemakers";
import { createWinemaker } from "@/lib/api/winemakers";
import { ApiResult } from "@/lib/api/types";
import { PageHeader } from "@/components/page/PageHeader";

async function handleCreate(winemaker: WineMaker): Promise<ApiResult<WineMaker>> {
  console.log("Create winemaker:", winemaker);

  try {
    return createWinemaker(winemaker);
  } catch (err: any) {
    console.error("Create failed:", err);
    throw err;
  }
}

export default function NewWinemakerPage() {
  return (
    <section>
      <PageHeader title="New Winemaker"/>
      <GenericCard<WineMaker>
        mode="create"
        fields={winemakerFields}
        processSave={handleCreate}
        redirectTo="/winemakers"
      />
    </section>

  );
}
