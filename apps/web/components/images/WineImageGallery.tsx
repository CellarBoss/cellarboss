"use client";

import { useQueries } from "@tanstack/react-query";
import { getImagesByVintageId } from "@/lib/api/images";
import { ImageGallery } from "./ImageGallery";

type Props = { vintageIds: number[]; className?: string };

export function WineImageGallery({ vintageIds, className }: Props) {
  const imageQueries = useQueries({
    queries: vintageIds.map((id) => ({
      queryKey: ["images", id],
      queryFn: async () => {
        const result = await getImagesByVintageId(id);
        if (!result.ok) throw new Error("Failed to fetch images");
        return result.data;
      },
    })),
  });

  return (
    <ImageGallery
      images={imageQueries.flatMap((q) => q.data ?? [])}
      isLoading={imageQueries.some((q) => q.isLoading)}
      readOnly
      className={className}
    />
  );
}
