"use client";

import { useParams } from "next/navigation";
import { getVintageById } from "@/lib/api/vintages";
import type { Vintage } from "@cellarboss/types";
import { GenericCard } from "@/components/cards/GenericCard";
import { PageHeader } from "@/components/page/PageHeader";
import { vintageFields } from "@/lib/fields/vintages";
import { useApiQuery } from "@/hooks/use-api-query";
import { queryGate } from "@/lib/functions/query-gate";
import { TastingNotesSection } from "@/components/tasting-notes/TastingNotesSection";
import { ImageGallery } from "@/components/images/ImageGallery";
import { ImageUpload } from "@/components/images/ImageUpload";

export default function ViewVintagePage() {
  const params = useParams();
  const vintageId = Number(params.id);

  const vintageQuery = useApiQuery({
    queryKey: ["vintage", vintageId],
    queryFn: () => getVintageById(vintageId),
    enabled: !!vintageId,
  });

  const result = queryGate([vintageQuery]);
  if (!result.ready) return result.gate;

  const [vintage] = result.data;

  return (
    <section>
      <PageHeader title={`View Vintage - ${vintage.year ?? "NV"}`} />
      <GenericCard<Vintage> mode="view" data={vintage} fields={vintageFields} />
      <TastingNotesSection vintageId={vintageId} />
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3">Images</h2>
        <ImageGallery vintageId={vintageId} />
        <ImageUpload vintageId={vintageId} />
      </div>
    </section>
  );
}
