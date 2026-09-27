"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import type { ImportPreview } from "@cellarboss/types";
import { WINE_TYPES } from "@cellarboss/validators/constants";
import { vintageFormValidators } from "@cellarboss/validators/vintages.validator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GenericField } from "@/components/cards/GenericField";
import { SaveButton } from "@/components/buttons/SaveButton";
import { commitImport } from "@/lib/api/import";
import { getWinemakers } from "@/lib/api/winemakers";
import { getCountries } from "@/lib/api/countries";
import { getRegions } from "@/lib/api/regions";
import { getGrapes } from "@/lib/api/grapes";
import { formatWineType } from "@/lib/functions/format";
import {
  buildCommit,
  EMPTY_IMPORT_FORM,
  formValuesFromPreview,
  LOW_CONFIDENCE,
  pendingName,
  type ImportFormValues,
} from "@/lib/functions/import";
import {
  FieldStatusLine,
  GrapeStatusLines,
  LowConfidenceHint,
} from "./FieldStatus";

const typeOptions = WINE_TYPES.map((t) => ({
  value: t,
  label: formatWineType(t),
}));

const schema = z
  .object({
    name: z.string().trim().min(1, "A name is required").max(255),
    type: z.enum(WINE_TYPES, "A type must be selected"),
    wineMakerId: z.string().min(1, "A winemaker must be selected"),
    countryId: z.string(),
    regionId: z.string(),
    grapeIds: z.array(z.string()),
    year: vintageFormValidators.year,
    drinkFrom: vintageFormValidators.drinkFrom,
    drinkUntil: vintageFormValidators.drinkUntil,
  })
  .superRefine((values, ctx) => {
    if (pendingName(values.regionId) && !values.countryId) {
      ctx.addIssue({
        code: "custom",
        path: ["countryId"],
        message: "A new region needs a country",
      });
    }
  });

// Adding a vintage to an existing wine only checks the vintage fields.
const vintageSchema = z.object({
  year: vintageFormValidators.year,
  drinkFrom: vintageFormValidators.drinkFrom,
  drinkUntil: vintageFormValidators.drinkUntil,
});

type ImportFormProps = {
  /** The preview to fill the form from, or null to start blank. */
  preview: ImportPreview | null;
};

/**
 * The import form. Its shape follows what already exists: the full wine and
 * vintage form for a new wine, or only the vintage fields when the wine is
 * already in the cellar. The page shows a vintage that already exists instead
 * of this form.
 */
export function ImportForm({ preview }: ImportFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const existingWine = preview?.existing.wine ?? null;
  const [addToExisting, setAddToExisting] = useState(existingWine !== null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Typed loosely, as in GenericCard, so the zod schemas (whose inputs are
  // unknown before preprocessing) can validate the string form state.
  const defaultValues: Record<string, unknown> = preview
    ? formValuesFromPreview(preview)
    : EMPTY_IMPORT_FORM;

  const activeSchema: z.ZodType<
    unknown,
    Record<string, unknown>
  > = addToExisting ? vintageSchema : schema;

  const form = useForm({
    defaultValues,
    validators: {
      onChange: addToExisting ? undefined : activeSchema,
      onSubmit: activeSchema,
    },
    onSubmit: async ({ value }) => {
      setIsProcessing(true);
      setErrorMessage(null);
      try {
        const result = await commitImport(
          buildCommit(
            value as ImportFormValues,
            addToExisting && existingWine ? existingWine.id : undefined,
          ),
        );
        if (!result.ok) {
          setErrorMessage(result.error.message);
          return;
        }
        // Winemakers, regions, grapes and wines may all be new.
        void queryClient.invalidateQueries();
        router.push(`/vintages/${result.data.vintageId}`);
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setIsProcessing(false);
      }
    },
  });

  const wine = preview?.wine;
  const resolution = preview?.resolution;
  const lowConfidence = (confidence: number | undefined) =>
    confidence !== undefined && confidence < LOW_CONFIDENCE;
  const createInstead =
    (key: "wineMakerId" | "countryId" | "regionId") => (value: string) =>
      form.setFieldValue(key, value);

  const yearText = wine?.vintage?.year
    ? (wine.vintage.year.value ?? "non-vintage")
    : null;

  return (
    <form
      id="ImportForm"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Card>
        <CardContent>
          <div className="w-full max-w-md flex flex-col gap-1">
            {addToExisting && existingWine ? (
              <>
                <p className="mb-3 text-sm" data-testid="import-existing-wine">
                  You already have <strong>{existingWine.name}</strong>. This
                  will add{" "}
                  {yearText ? `the ${yearText} vintage` : "a new vintage"} to
                  it.{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => setAddToExisting(false)}
                  >
                    Not this wine
                  </Button>
                </p>
                <GenericField
                  form={form}
                  name="wineMakerId"
                  label="Winemaker"
                  type="selector"
                  editable={false}
                  selectorConfig={{
                    queryKey: "winemakers",
                    queryFn: getWinemakers,
                  }}
                />
              </>
            ) : (
              <>
                <GenericField form={form} name="name" label="Name" />
                {lowConfidence(wine?.name?.confidence) && <LowConfidenceHint />}
                <GenericField
                  form={form}
                  name="type"
                  label="Type"
                  type="fixed-list"
                  options={typeOptions}
                />
                {lowConfidence(wine?.type?.confidence) && <LowConfidenceHint />}
                <GenericField
                  form={form}
                  name="wineMakerId"
                  label="Winemaker"
                  type="selector"
                  selectorConfig={{
                    queryKey: "winemakers",
                    queryFn: getWinemakers,
                    allowCreate: true,
                  }}
                />
                <form.Subscribe
                  selector={(s) => s.values.wineMakerId as string}
                >
                  {(value) => (
                    <FieldStatusLine
                      resolution={resolution?.winemaker}
                      value={value}
                      onCreateInstead={createInstead("wineMakerId")}
                    />
                  )}
                </form.Subscribe>
                <GenericField
                  form={form}
                  name="countryId"
                  label="Country"
                  type="selector"
                  selectorConfig={{
                    queryKey: "countries",
                    queryFn: getCountries,
                    allowCreate: true,
                  }}
                />
                <form.Subscribe selector={(s) => s.values.countryId as string}>
                  {(value) => (
                    <FieldStatusLine
                      resolution={resolution?.country}
                      value={value}
                      onCreateInstead={createInstead("countryId")}
                    />
                  )}
                </form.Subscribe>
                <GenericField
                  form={form}
                  name="regionId"
                  label="Region"
                  type="selector"
                  selectorConfig={{
                    queryKey: "regions",
                    queryFn: getRegions,
                    allowCreate: true,
                    groupBy: {
                      key: "countryId",
                      queryKey: "countries",
                      queryFn: getCountries,
                    },
                  }}
                />
                <form.Subscribe selector={(s) => s.values.regionId as string}>
                  {(value) => (
                    <FieldStatusLine
                      resolution={resolution?.region}
                      value={value}
                      onCreateInstead={createInstead("regionId")}
                    />
                  )}
                </form.Subscribe>
                <GenericField
                  form={form}
                  name="grapeIds"
                  label="Grapes"
                  type="selector"
                  selectorConfig={{
                    queryKey: "grapes",
                    queryFn: getGrapes,
                    allowMultiple: true,
                    allowCreate: true,
                  }}
                />
                <form.Subscribe selector={(s) => s.values.grapeIds as string[]}>
                  {(values) => (
                    <GrapeStatusLines
                      resolutions={resolution?.grapes ?? []}
                      values={values}
                      onChange={(next) => form.setFieldValue("grapeIds", next)}
                    />
                  )}
                </form.Subscribe>
              </>
            )}

            <GenericField
              form={form}
              name="year"
              label="Vintage Year"
              type="number"
            />
            {lowConfidence(wine?.vintage?.year?.confidence) && (
              <LowConfidenceHint />
            )}
            <GenericField
              form={form}
              name="drinkFrom"
              label="Drink From"
              type="number"
            />
            <GenericField
              form={form}
              name="drinkUntil"
              label="Drink Until"
              type="number"
            />
          </div>
        </CardContent>
      </Card>

      <span className="flex items-center gap-4 mt-4">
        <SaveButton isProcessing={isProcessing} />
        {errorMessage && (
          <span className="mx-2 text-red-600">{errorMessage}</span>
        )}
      </span>
    </form>
  );
}
