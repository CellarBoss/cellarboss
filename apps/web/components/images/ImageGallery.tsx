"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Image } from "@cellarboss/types";
import {
  deleteImage,
  setImageFavourite,
  unsetImageFavourite,
} from "@/lib/api/images";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { X, Trash2, Star } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import NextImage from "next/image";
import { ImageLoadingCell } from "./ImageLoadingCell";
import { ImageEmptyCell } from "./ImageEmptyCell";
import { ImageThumbnailCell } from "./ImageThumbnailCell";
import { ImageUploadCell } from "./ImageUploadCell";

type Props = {
  images: Image[];
  isLoading: boolean;
  className?: string;
  readOnly?: boolean;
  vintageId?: number;
  invalidateQueryKeys?: unknown[][];
};

export function ImageGallery({
  images,
  isLoading,
  className = "mt-6",
  readOnly = false,
  vintageId,
  invalidateQueryKeys = [],
}: Props) {
  const queryClient = useQueryClient();
  const [lightboxId, setLightboxId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Image | null>(null);
  const [togglingFavouriteId, setTogglingFavouriteId] = useState<number | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  const lightboxImage = images.find((i) => i.id === lightboxId) ?? null;

  function invalidateAll() {
    for (const key of invalidateQueryKeys) {
      queryClient.invalidateQueries({ queryKey: key });
    }
  }

  function promptDelete(image: Image, e: React.MouseEvent) {
    e.stopPropagation();
    setDeleteTarget(image);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteImage(deleteTarget.id);
      invalidateAll();
      if (lightboxImage?.id === deleteTarget.id) setLightboxId(null);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  async function handleToggleFavourite(image: Image, e: React.MouseEvent) {
    e.stopPropagation();
    setTogglingFavouriteId(image.id);
    try {
      if (image.isFavourite) {
        await unsetImageFavourite(image.id);
      } else {
        await setImageFavourite(image.id);
      }
      invalidateAll();
    } finally {
      setTogglingFavouriteId(null);
    }
  }

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Images
            {!isLoading && <span className="ml-1">({images.length})</span>}
          </h2>
        </div>
        <Card>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {isLoading && <ImageLoadingCell />}

              {!isLoading && images.length === 0 && <ImageEmptyCell />}

              {images.map((image) =>
                readOnly ? (
                  <div
                    key={image.id}
                    className="relative aspect-square rounded-md overflow-hidden cursor-pointer border border-border w-[150px] h-[150px]"
                    onClick={() => setLightboxId(image.id)}
                  >
                    <NextImage
                      src={`/api/image/${image.id}/thumb`}
                      alt="Wine image"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <ImageThumbnailCell
                    key={image.id}
                    image={image}
                    onClick={() => setLightboxId(image.id)}
                    onDelete={(e) => promptDelete(image, e)}
                    onToggleFavourite={(e) => handleToggleFavourite(image, e)}
                    isDeleting={deletingId === image.id}
                    isTogglingFavourite={togglingFavouriteId === image.id}
                  />
                ),
              )}

              {!readOnly && vintageId !== undefined && (
                <ImageUploadCell
                  vintageId={vintageId}
                  onError={setUploadError}
                />
              )}
            </div>

            {uploadError && (
              <p className="mt-2 text-sm text-destructive">{uploadError}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={!!lightboxImage}
        onOpenChange={(open) => !open && setLightboxId(null)}
      >
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <DialogDescription className="sr-only">
            Full size image preview
          </DialogDescription>
          {lightboxImage && (
            <div className="relative">
              <NextImage
                src={`/api/image/${lightboxImage.id}/file`}
                alt="Image full size"
                width={0}
                height={0}
                unoptimized
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                {!readOnly && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) =>
                            handleToggleFavourite(
                              images.find((i) => i.id === lightboxImage.id) ??
                                lightboxImage,
                              e,
                            )
                          }
                          disabled={togglingFavouriteId === lightboxImage.id}
                        >
                          <Star
                            className="w-4 h-4"
                            fill={lightboxImage.isFavourite ? "gold" : "none"}
                            stroke={
                              lightboxImage.isFavourite
                                ? "gold"
                                : "currentColor"
                            }
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {lightboxImage.isFavourite
                          ? "Unfavourite"
                          : "Favourite"}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="dark:bg-destructive"
                          onClick={(e) => promptDelete(lightboxImage, e)}
                          disabled={deletingId === lightboxImage.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setLightboxId(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Close</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {!readOnly && (
        <AlertDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete image</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this image? This action cannot
                be undone.
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
      )}
    </>
  );
}
