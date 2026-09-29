"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import type { ImportPreview } from "@cellarboss/types";
import { PageHeader } from "@/components/page/PageHeader";
import { BackButton } from "@/components/buttons/BackButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { ImportForm } from "@/components/import/ImportForm";
import { previewImport } from "@/lib/api/import";

type ImportState =
  | { step: "enter" }
  | { step: "loading" }
  | { step: "failed"; attempt: number }
  | { step: "found"; preview: ImportPreview; attempt: number };

export default function ImportWinePage() {
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ImportState>({ step: "enter" });
  const [attempts, setAttempts] = useState(0);

  async function handleRead(e: React.FormEvent) {
    e.preventDefault();
    const attempt = attempts + 1;
    setAttempts(attempt);
    setState({ step: "loading" });
    const result = await previewImport(url.trim()).catch(() => null);
    setState(
      result?.ok
        ? { step: "found", preview: result.data, attempt }
        : { step: "failed", attempt },
    );
  }

  const existingVintage =
    state.step === "found" ? state.preview.existing.vintage : null;

  return (
    <section>
      <PageHeader title="Import Wine" />

      <form onSubmit={handleRead} className="mb-4">
        <Card>
          <CardContent>
            <div className="w-full max-w-md flex flex-col gap-3">
              <Field>
                <FieldLabel htmlFor="import-url">Product page link</FieldLabel>
                <Input
                  id="import-url"
                  type="url"
                  required
                  placeholder="https://"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  autoComplete="off"
                />
                <FieldDescription>
                  Paste a link to a wine&rsquo;s page on a shop&rsquo;s website.
                </FieldDescription>
              </Field>

              <Button
                type="submit"
                variant="outline"
                className="self-start cursor-pointer"
                disabled={state.step === "loading" || !url.trim()}
              >
                {state.step === "loading" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download />
                )}
                Get details
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {state.step === "failed" && (
        <>
          <p className="mb-4 text-sm" role="status">
            Couldn&rsquo;t get details from this link. You can fill in the form
            yourself.
          </p>
          <ImportForm key={state.attempt} preview={null} />
        </>
      )}

      {state.step === "found" && existingVintage && (
        <Card>
          <CardContent className="flex flex-col items-start gap-3">
            <p className="text-sm" role="status">
              You already have the {existingVintage.year ?? "non-vintage"}{" "}
              vintage of <strong>{state.preview.existing.wine?.name}</strong>.
            </p>
            <Button asChild variant="outline">
              <Link href={`/vintages/${existingVintage.id}`}>Open vintage</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {state.step === "found" && !existingVintage && (
        <ImportForm key={state.attempt} preview={state.preview} />
      )}

      {state.step !== "found" && state.step !== "failed" && (
        <span className="flex items-center gap-4 mt-4">
          <BackButton />
        </span>
      )}
    </section>
  );
}
