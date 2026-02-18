"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page/PageHeader";
import { UrlInputStep } from "./components/UrlInputStep";
import { PreviewStep } from "./components/PreviewStep";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/query-gate";
import { getWinemakers } from "@/lib/api/winemakers";
import { getCountries } from "@/lib/api/countries";
import { getRegions } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import { getStorages } from "@/lib/api/storages";
import type { ImportPreview } from "@/lib/api/import";

export default function ImportPage() {
  const [preview, setPreview] = useState<ImportPreview | null>(null);

  const winemakersQuery = useApiQuery({ queryKey: ["winemakers"], queryFn: getWinemakers });
  const countriesQuery = useApiQuery({ queryKey: ["countries"], queryFn: getCountries });
  const regionsQuery = useApiQuery({ queryKey: ["regions"], queryFn: getRegions });
  const grapesQuery = useApiQuery({ queryKey: ["grapes"], queryFn: getGrapes });
  const storagesQuery = useApiQuery({ queryKey: ["storages"], queryFn: getStorages });

  const result = queryGate(winemakersQuery, countriesQuery, regionsQuery, grapesQuery, storagesQuery);
  if (!result.ready) return (
    <section>
      <PageHeader title="Import Bottle" />
      {result.gate}
    </section>
  );

  const [winemakers, countries, regions, grapes, storages] = result.data;

  return (
    <section>
      <PageHeader title="Import Bottle" />

      {!preview ? (
        <UrlInputStep onScraped={setPreview} />
      ) : (
        <PreviewStep
          preview={preview}
          winemakers={winemakers}
          countries={countries}
          regions={regions}
          grapes={grapes}
          storages={storages}
          onBack={() => setPreview(null)}
        />
      )}
    </section>
  );
}
