"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Image } from "@cellarboss/types";
import { useApiQuery } from "@/hooks/use-api-query";
import { getImagesByVintageId, deleteImage } from "@/lib/api/images";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Trash2 } from "lucide-react";

type Props = { vintageId: number };

export function ImageGallery({ vintageId }: Props) {
  const queryClient = useQueryClient();
  const [lightboxImage, setLightboxImage] = useState<Image | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const imagesQuery = useApiQuery<Image[]>({
    queryKey: ["images", vintageId],
    queryFn: () => getImagesByVintageId(vintageId),
  });

  const images = imagesQuery.data ?? [];

  async function handleDelete(image: Image, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete this image?`)) return;
    setDeletingId(image.id);
    try {
      await deleteImage(image.id);
      queryClient.invalidateQueries({ queryKey: ["images", vintageId] });
      if (lightboxImage?.id === image.id) setLightboxImage(null);
    } finally {
      setDeletingId(null);
    }
  }

  if (imagesQuery.isLoading) {
    return (
      <p className="text-muted-foreground italic text-sm">Loading images...</p>
    );
  }

  if (images.length === 0) {
    return (
      <p className="text-muted-foreground italic text-sm">No images yet.</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="relative group aspect-square rounded-md overflow-hidden cursor-pointer border border-border"
            onClick={() => setLightboxImage(image)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/image/${image.id}/thumb`}
              alt="Vintage image"
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => handleDelete(image, e)}
              disabled={deletingId === image.id}
              className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-40"
              aria-label="Delete image"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <Dialog
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxImage(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {lightboxImage && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/image/${lightboxImage.id}/file`}
                alt="Vintage image full size"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => handleDelete(lightboxImage, e)}
                  disabled={deletingId === lightboxImage.id}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setLightboxImage(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
