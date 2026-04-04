"use client";

import type { Image } from "@cellarboss/types";
import { getImagesByVintageId } from "@/lib/api/images";
import { useApiQuery } from "@/hooks/use-api-query";
import { ImageGallery } from "./ImageGallery";

type Props = { vintageId: number; className?: string };

export function VintageImageGallery({ vintageId, className }: Props) {
  const imagesQuery = useApiQuery<Image[]>({
    queryKey: ["images", vintageId],
    queryFn: () => getImagesByVintageId(vintageId),
  });

  return (
    <ImageGallery
      images={imagesQuery.data ?? []}
      isLoading={imagesQuery.isLoading}
      vintageId={vintageId}
      invalidateQueryKeys={[["images", vintageId]]}
      className={className}
    />
  );
}
