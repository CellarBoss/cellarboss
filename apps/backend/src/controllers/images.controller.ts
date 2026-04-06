import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import { deleteImage } from "@utils/upload.js";
import type { Image } from "@cellarboss/types";

type DbRow = Omit<Image, "isFavourite"> & { isFavourite: number };

function toImage(row: DbRow): Image {
  return { ...row, isFavourite: row.isFavourite === 1 };
}

export async function listByVintageId(vintageId: number): Promise<Image[]> {
  const rows = await db
    .selectFrom("image")
    .selectAll()
    .where("vintageId", "=", vintageId)
    .orderBy("createdAt", "asc")
    .execute();
  return rows.map(toImage);
}

export async function getById(id: number): Promise<Image | undefined> {
  const row = await db
    .selectFrom("image")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  return row ? toImage(row) : undefined;
}

export async function create(data: {
  vintageId: number;
  filename: string;
  size: number;
  createdBy: string;
  createdAt: string;
}): Promise<Image> {
  const row = await insertReturning(db, "image", data);
  return toImage(row);
}

export async function remove(id: number) {
  const image = await db
    .selectFrom("image")
    .select("filename")
    .where("id", "=", id)
    .executeTakeFirst();

  if (image) {
    await db.deleteFrom("image").where("id", "=", id).execute();
    await deleteImage(image.filename);
  }
}

export async function removeByVintageId(vintageId: number) {
  const images = await db
    .selectFrom("image")
    .select("filename")
    .where("vintageId", "=", vintageId)
    .execute();

  if (images.length > 0) {
    await db.deleteFrom("image").where("vintageId", "=", vintageId).execute();
    await Promise.allSettled(images.map((img) => deleteImage(img.filename)));
  }
}

export async function setFavourite(
  id: number,
  vintageId: number,
): Promise<Image> {
  await db
    .updateTable("image")
    .set({ isFavourite: 0 })
    .where("vintageId", "=", vintageId)
    .where("isFavourite", "=", 1)
    .execute();

  const row = await updateReturning(db, "image", id, { isFavourite: 1 });
  return toImage(row);
}

export async function unsetFavourite(id: number): Promise<Image> {
  const row = await updateReturning(db, "image", id, { isFavourite: 0 });
  return toImage(row);
}

export async function getAllFilenames(): Promise<Set<string>> {
  const rows = await db.selectFrom("image").select("filename").execute();
  return new Set(rows.map((r) => r.filename));
}
