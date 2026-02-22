"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from '@tanstack/react-form';
import { Card } from "./Card";
import { GenericField } from "./GenericField";
import { SaveButton } from "@/components/buttons/SaveButton";
import { ResetButton } from "@/components/buttons/ResetButton";
import { FieldConfig } from "@/lib/types/field";
import { BackButton } from "@/components/buttons/BackButton";
import { ApiResult } from "@/lib/api/types";
import { stringifyValues } from "@/lib/functions/strings";
import * as z from "zod";

type GenericCardProps<T extends { id: number | string }> = {
  mode: "view" | "edit" | "create" | "clone";
  data?: T;
  fields: FieldConfig<T>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processSave?: (data: any) => Promise<ApiResult<T>>;
  redirectTo?: string;
};

export function GenericCard<T extends { id: number | string }>({
  mode,
  data,
  fields,
  processSave,
  redirectTo = "/",
}: GenericCardProps<T>) {
  const router = useRouter();
  const editable = mode !== "view";

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const zodShape: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    if (field.validator) {
      zodShape[field.key as string] = field.validator;
    }
  });

  const zodSchema = z.object(zodShape);

  const form = useForm({
    defaultValues: stringifyValues(data), // We must stringify to allow proper comparison within Select elements
    validators: {
      onChange: zodSchema,
    },
    onSubmit: async ({ value }) => {
      if (!processSave) {
        console.error("Tried to save but no processSave function provided.");
        return;
      }
      setIsProcessing(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      try {
        const result = await processSave(value);

        if (!result.ok) {
          const errors = [];
          for (const err in result.error.errors) {
            errors.push(result.error.errors[err]);
          }
          setErrorMessage(result.error.message + ": " + errors.join(", "));
          return;
        }

        setSuccessMessage("Changes saved successfully!");
        
        setTimeout(() => {
          router.push(redirectTo);
        }, 1500);
      } catch (err: unknown) {
        console.error(err);
        setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setIsProcessing(false);
      }
    },
  });

  return (
    <>
      <form
        id="GenericForm"
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <Card>
          <div className="w-full max-w-md">
            {fields.map((field) => (
              <GenericField
                form={form}
                key={String(field.key)}
                name={String(field.key)}
                label={field.label}
                type={field.type}
                editable={editable && field.editable !== false}
                selectorConfig={"selectorConfig" in field ? field.selectorConfig : undefined}
                options={"options" in field ? field.options : undefined}
                numberProps={"numberProps" in field ? field.numberProps : undefined}
              />
            ))}
          </div>
        </Card>

        <span className="flex items-center gap-4 mt-4">
          <BackButton />
          {mode === "edit" && (
            <ResetButton isProcessing={isProcessing} form={form} />
          )}
          {editable && (
            <SaveButton isProcessing={isProcessing} form={form} />
          )}
          {errorMessage && (
            <span className="mx-2 text-red-600">{errorMessage}</span>
          )}
          {successMessage && (
            <span className="mx-2 text-green-600">{successMessage}</span>
          )}
        </span>
      </form>
    </>
  );
}