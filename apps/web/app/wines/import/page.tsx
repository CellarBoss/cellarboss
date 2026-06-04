"use client";

import { useMemo, useState, useTransition } from "react";
import type {
  Country,
  Grape,
  Region,
  Wine,
  WineMaker,
} from "@cellarboss/types";
import { LinkIcon } from "lucide-react";
import * as z from "zod";
import { PageHeader } from "@/components/page/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GenericCard } from "@/components/cards/GenericCard";
import { LoadingCard } from "@/components/cards/LoadingCard";
import { ErrorCard } from "@/components/cards/ErrorCard";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import { getWinemakers } from "@/lib/api/winemakers";
import { getRegions } from "@/lib/api/regions";
import { getCountries } from "@/lib/api/countries";
import { getGrapes } from "@/lib/api/grapes";
import { createWinemaker } from "@/lib/api/winemakers";
import { createRegion } from "@/lib/api/regions";
import { createCountry } from "@/lib/api/countries";
import { createGrape } from "@/lib/api/grapes";
import { createWine } from "@/lib/api/wines";
import { createWineGrape } from "@/lib/api/winegrapes";
import { wineFields, type WineFormData } from "@/lib/fields/wines";
import type { FieldConfig } from "@/lib/types/field";
import {
  buildWineImportDraft,
  type ImportedWineDetails,
} from "@/lib/import/wine-url";
import { importWineFromUrl } from "@/lib/import/wine-url-action";
import type { ApiError, ApiResult } from "@/lib/api/types";

const wineImportFields: FieldConfig<WineFormData>[] = wineFields.map((field) =>
  field.key === "wineMakerId"
    ? {
        ...field,
        validator: z.preprocess(
          (value) => (value === "" || value == null ? 0 : Number(value)),
          z.number().int().min(0),
        ) as FieldConfig<WineFormData>["validator"],
      }
    : field,
);

export default function ImportWinePage() {
  const [url, setUrl] = useState("");
  const [details, setDetails] = useState<ImportedWineDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const winemakersQuery = useApiQuery({
    queryKey: ["winemakers"],
    queryFn: getWinemakers,
  });
  const regionsQuery = useApiQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
  });
  const countriesQuery = useApiQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
  });
  const grapesQuery = useApiQuery({ queryKey: ["grapes"], queryFn: getGrapes });

  const result = queryGate([
    winemakersQuery,
    regionsQuery,
    countriesQuery,
    grapesQuery,
  ]);

  const draft = useMemo(() => {
    if (!details || !result.ready) return null;
    const [winemakers, regions, countries, grapes] = result.data;
    return buildWineImportDraft(details, {
      winemakers,
      regions,
      countries,
      grapes,
    });
  }, [details, result]);

  function handleImport() {
    setErrorMessage(null);
    setDetails(null);

    startTransition(async () => {
      const importResult = await importWineFromUrl(url);
      if (!importResult.ok) {
        setErrorMessage(importResult.error);
        return;
      }
      setDetails(importResult.data);
    });
  }

  async function handleCreate(
    formData: WineFormData,
  ): Promise<ApiResult<WineFormData>> {
    if (!details || !draft) {
      return importError("Import details are no longer available.");
    }

    const formValues = { ...formData };
    delete (formValues as Partial<WineFormData>).id;
    const { grapeIds, ...wineValues } = formValues;

    let wineMakerId = Number(wineValues.wineMakerId);
    if (!wineMakerId && details.winemakerName) {
      const winemakerResult = await createWinemaker({
        name: details.winemakerName,
      } as WineMaker);
      if (!winemakerResult.ok) {
        return importError(
          "Could not create imported winemaker.",
          winemakerResult.error,
        );
      }
      wineMakerId = winemakerResult.data.id;
    }

    if (!wineMakerId) {
      return importError(
        "A winemaker must be selected or detected before import.",
      );
    }

    let regionId = wineValues.regionId ? Number(wineValues.regionId) : null;
    if (!regionId && details.regionName) {
      let countryId = draft.matches.country?.id;

      if (!countryId && details.countryName) {
        const countryResult = await createCountry({
          name: details.countryName,
        } as Country);
        if (!countryResult.ok) {
          return importError(
            "Could not create imported country.",
            countryResult.error,
          );
        }
        countryId = countryResult.data.id;
      }

      if (countryId) {
        const regionResult = await createRegion({
          name: details.regionName,
          countryId,
        } as Region);
        if (!regionResult.ok) {
          return importError(
            "Could not create imported region.",
            regionResult.error,
          );
        }
        regionId = regionResult.data.id;
      }
    }

    const grapeIdSet = new Set(
      (Array.isArray(grapeIds) ? grapeIds : []).map(Number).filter(Boolean),
    );
    for (const grapeName of draft.unmatched.grapeNames) {
      const grapeResult = await createGrape({ name: grapeName } as Grape);
      if (!grapeResult.ok) {
        return importError(
          "Could not create imported grape.",
          grapeResult.error,
        );
      }
      grapeIdSet.add(grapeResult.data.id);
    }

    const grapeIdList = [...grapeIdSet];
    const result = await createWine({
      name: wineValues.name,
      type: wineValues.type,
      wineMakerId,
      regionId,
    } as Wine);
    if (!result.ok) return result;

    const newWine = result.data;
    for (const grapeId of grapeIdList) {
      const grapeResult = await createWineGrape({
        wineId: newWine.id,
        grapeId,
      });
      if (!grapeResult.ok) {
        return { ok: false, error: grapeResult.error };
      }
    }

    return { ok: true, data: { ...newWine, grapeIds: grapeIdList } };
  }

  if (!result.ready) {
    return result.gate;
  }

  return (
    <section>
      <PageHeader title="Import Wine" />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Source URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/wines/example-wine"
              aria-label="Wine page URL"
            />
            <Button
              type="button"
              onClick={handleImport}
              disabled={isPending || !url.trim()}
            >
              <LinkIcon />
              {isPending ? "Importing..." : "Import"}
            </Button>
          </div>

          {errorMessage && (
            <div className="text-sm text-red-600">{errorMessage}</div>
          )}
        </CardContent>
      </Card>

      {isPending && <LoadingCard />}

      {details && draft && (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
          <ImportSummary details={details} draft={draft} />
          <GenericCard<WineFormData>
            key={details.sourceUrl}
            mode="create"
            data={draft.data as WineFormData}
            fields={wineImportFields}
            processSave={handleCreate}
            redirectTo="/wines"
          />
        </div>
      )}

      {details && !draft && (
        <ErrorCard message="Could not prepare import draft." />
      )}
    </section>
  );
}

function ImportSummary({
  details,
  draft,
}: {
  details: ImportedWineDetails;
  draft: ReturnType<typeof buildWineImportDraft>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Draft</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SummaryRow label="Name" value={details.name} />
        <SummaryRow label="Type" value={details.type} />
        <SummaryRow
          label="Vintage"
          value={details.vintageYear ? String(details.vintageYear) : null}
        />
        <MatchRow
          label="Winemaker"
          matched={draft.matches.winemaker?.name}
          unmatched={draft.unmatched.winemakerName}
        />
        <MatchRow
          label="Region"
          matched={draft.matches.region?.name}
          unmatched={draft.unmatched.regionName}
        />
        <MatchRow
          label="Country"
          matched={draft.matches.country?.name}
          unmatched={draft.unmatched.countryName}
        />
        <div className="space-y-2">
          <div className="text-sm font-medium">Grapes</div>
          <div className="flex flex-wrap gap-2">
            {draft.matches.grapes.map((grape) => (
              <Badge key={grape.id} variant="secondary">
                {grape.name}
              </Badge>
            ))}
            {draft.unmatched.grapeNames.map((grapeName) => (
              <Badge key={grapeName} variant="outline">
                New: {grapeName}
              </Badge>
            ))}
            {!draft.matches.grapes.length &&
              !draft.unmatched.grapeNames.length && (
                <span className="text-sm text-muted-foreground">
                  None detected
                </span>
              )}
          </div>
        </div>
        {details.sourceTitle && (
          <SummaryRow label="Page title" value={details.sourceTitle} />
        )}
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-sm text-muted-foreground">
        {value ?? "Not detected"}
      </div>
    </div>
  );
}

function MatchRow({
  label,
  matched,
  unmatched,
}: {
  label: string;
  matched?: string;
  unmatched: string | null;
}) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">{label}</div>
      {matched ? (
        <Badge variant="secondary">{matched}</Badge>
      ) : unmatched ? (
        <Badge variant="outline">New: {unmatched}</Badge>
      ) : (
        <span className="text-sm text-muted-foreground">Not detected</span>
      )}
    </div>
  );
}

function importError(
  message: string,
  cause?: ApiError,
): ApiResult<WineFormData> {
  return {
    ok: false,
    error: {
      message,
      errors: cause?.errors ?? {},
      status: cause?.status ?? 400,
    },
  };
}
