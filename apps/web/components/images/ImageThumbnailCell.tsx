import type { Image } from "@cellarboss/types";
import { Trash2 } from "lucide-react";

type Props = {
  image: Image;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isDeleting: boolean;
};

export function ImageThumbnailCell({
  image,
  onClick,
  onDelete,
  isDeleting,
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
