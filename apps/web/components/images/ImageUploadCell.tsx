"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { CELL } from "./image-cell-class";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type Props = {
  vintageId: number;
  onError: (message: string) => void;
};

export function ImageUploadCell({ vintageId, onError }: Props) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList) {
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) {
        onError(`${file.name} exceeds the 10MB limit.`);
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("vintageId", String(vintageId));

        const res = await fetch("/api/image/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `Upload failed (${res.status})`);
        }
      }
      queryClient.invalidateQueries({ queryKey: ["images", vintageId] });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <div
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`${CELL} flex-col gap-1 border-dashed border-2 text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors text-xs text-center px-2`}
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <ImagePlus className="w-5 h-5" />
            <span>Upload</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
        }}
      />
    </>
  );
}
