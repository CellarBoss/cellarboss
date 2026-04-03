import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import sharp from "sharp";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function getUploadDir(): string {
  // Read from process.env at call time so tests can override after module import
  return process.env.UPLOAD_DIR ?? "./uploads";
}

function getImagesDir(): string {
  return path.join(getUploadDir(), "images");
}

function getThumbsDir(): string {
  return path.join(getUploadDir(), "images", "thumbs");
}

export function getImagePath(filename: string): string {
  return path.resolve(path.join(getImagesDir(), filename));
}

export function getThumbPath(filename: string): string {
  return path.resolve(path.join(getThumbsDir(), filename));
}

export async function ensureUploadDirs(): Promise<void> {
  await fs.mkdir(getThumbsDir(), { recursive: true });
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

export async function saveImage(
  buffer: Buffer,
): Promise<{ filename: string; size: number }> {
  await ensureUploadDirs();

  const filename = `${randomUUID()}.jpg`;
  const imagePath = getImagePath(filename);
  const thumbPath = getThumbPath(filename);

  // Process original: strip EXIF, auto-rotate, scale to max 1600px, convert to JPEG
  const processedBuffer = await sharp(buffer)
    .rotate() // auto-rotate based on EXIF orientation
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  await fs.writeFile(imagePath, processedBuffer);

  // Generate thumbnail: 400px wide, JPEG quality 80
  await sharp(processedBuffer)
    .resize(400, undefined, { withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toFile(thumbPath);

  return { filename, size: processedBuffer.length };
}

export async function deleteImage(filename: string): Promise<void> {
  const imagePath = getImagePath(filename);
  const thumbPath = getThumbPath(filename);

  await Promise.allSettled([fs.unlink(imagePath), fs.unlink(thumbPath)]);
}

export async function cleanupOrphanedFiles(
  validFilenames: Set<string>,
): Promise<void> {
  const imagesDir = getImagesDir();

  let files: string[];
  try {
    files = await fs.readdir(imagesDir);
  } catch {
    // Directory doesn't exist yet — nothing to clean up
    return;
  }

  for (const file of files) {
    // Skip the thumbs subdirectory entry
    if (file === "thumbs") continue;

    if (!validFilenames.has(file)) {
      console.log(`Cleaning up orphaned image file: ${file}`);
      await deleteImage(file);
    }
  }
}
