import type { Image } from "@cellarboss/types";
import { Trash2, Star } from "lucide-react";

type Props = {
  image: Image;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onToggleFavourite: (e: React.MouseEvent) => void;
  isDeleting: boolean;
  isTogglingFavourite: boolean;
};

export function ImageThumbnailCell({
  image,
  onClick,
  onDelete,
  onToggleFavourite,
  isDeleting,
  isTogglingFavourite,
}: Props) {
  return (
    <div
      className="relative group aspect-square rounded-md overflow-hidden cursor-pointer border border-border w-[150px] h-[150px]"
      onClick={onClick}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/api/image/${image.id}/thumb`}
        alt="Vintage image"
        className="w-full h-full object-cover"
      />
      <button
        onClick={onToggleFavourite}
        disabled={isTogglingFavourite}
        className="absolute top-1 left-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-40"
        aria-label={image.isFavourite ? "Unset favourite" : "Set as favourite"}
      >
        <Star
          className="w-3 h-3"
          fill={image.isFavourite ? "gold" : "none"}
          stroke={image.isFavourite ? "gold" : "white"}
        />
      </button>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className="absolute top-1 right-1 p-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-40"
        aria-label="Delete image"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}
