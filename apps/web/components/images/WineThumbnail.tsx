"use client";

import { useState } from "react";
import type { Vintage, Image } from "@cellarboss/types";
import { useQueries } from "@tanstack/react-query";
import { ApiQueryError } from "@cellarboss/common";
import { getImagesByVintageId } from "@/lib/api/images";
import { Wine as WineIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import NextImage from "next/image";

type Props = {
  vintages: Vintage[];
  className?: string;
};

export function WineThumbnail({ vintages, className }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const sortedVintages = [...vintages].sort(
    (a, b) => (b.year ?? -Infinity) - (a.year ?? -Infinity),
  );

  const imageQueries = useQueries({
    queries: sortedVintages.map((v) => ({
      queryKey: ["images", v.id],
      queryFn: async (): Promise<Image[]> => {
        const result = await getImagesByVintageId(v.id);
        if (!result.ok) throw new ApiQueryError(result.error);
        return result.data;
      },
    })),
  });

  const image = (() => {
    for (const q of imageQueries) {
      if (q.data) {
        const fav = q.data.find((img) => img.isFavourite);
        if (fav) return fav;
      }
    }
    for (const q of imageQueries) {
      if (q.data && q.data.length > 0) {
        return [...q.data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )[0];
      }
    }
    return null;
  })();

  return (
    <>
      <div
        className={`relative flex items-center justify-center rounded-lg bg-muted overflow-hidden ${className ?? ""} ${image ? "cursor-pointer" : ""}`}
        onClick={() => image && setLightboxOpen(true)}
      >
        {image ? (
          <NextImage
            src={`/api/image/${image.id}/thumb`}
            alt="Wine image"
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <WineIcon className="w-10 h-10" />
        )}
      </div>

      {image && (
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden">
            <DialogTitle className="sr-only">Image preview</DialogTitle>
            <NextImage
              src={`/api/image/${image.id}/file`}
              alt="Wine image full size"
              width={0}
              height={0}
              unoptimized
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
