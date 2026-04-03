"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Image } from "@cellarboss/types";
import { useApiQuery } from "@/hooks/use-api-query";
import { getImagesByVintageId, deleteImage } from "@/lib/api/images";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X, Trash2 } from "lucide-react";
import { ImageLoadingCell } from "./ImageLoadingCell";
import { ImageEmptyCell } from "./ImageEmptyCell";
import { ImageThumbnailCell } from "./ImageThumbnailCell";
import { ImageUploadCell } from "./ImageUploadCell";

type Props = { vintageId: number };

export function ImageGallery({ vintageId }: Props) {
  const queryClient = useQueryClient();
  const [lightboxImage, setLightboxImage] = useState<Image | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Image | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imagesQuery = useApiQuery<Image[]>({
    queryKey: ["images", vintageId],
    queryFn: () => getImagesByVintageId(vintageId),
  });

  const images = imagesQuery.data ?? [];

  function promptDelete(image: Image, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteTarget(image);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteImage(deleteTarget.id);
      queryClient.invalidateQueries({ queryKey: ["images", vintageId] });
      if (lightboxImage?.id === deleteTarget.id) setLightboxImage(null);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {imagesQuery.isLoading && <ImageLoadingCell />}

        {!imagesQuery.isLoading && images.length === 0 && <ImageEmptyCell />}

        {images.map((image) => (
          <ImageThumbnailCell
            key={image.id}
            image={image}
            onClick={() => setLightboxImage(image)}
            onDelete={(e) => promptDelete(image, e)}
            isDeleting={deletingId === image.id}
          />
        ))}

        <ImageUploadCell vintageId={vintageId} onError={setUploadError} />
      </div>

      {uploadError && (
        <p className="mt-2 text-sm text-destructive">{uploadError}</p>
      )}

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
                  onClick={(e) => promptDelete(lightboxImage, e)}
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
