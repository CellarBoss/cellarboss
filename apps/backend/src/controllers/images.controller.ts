import { db } from "@utils/database.js";
import { deleteImage } from "@utils/upload.js";

export async function listByVintageId(vintageId: number) {
  return await db
    .selectFrom("image")
    .selectAll()
    .where("vintageId", "=", vintageId)
    .orderBy("sortOrder", "asc")
    .execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("image")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(data: {
  vintageId: number;
  filename: string;
  size: number;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
}) {
  return await db
    .insertInto("image")
    .values(data)
    .returningAll()
    .executeTakeFirstOrThrow();
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

export async function getAllFilenames(): Promise<Set<string>> {
  const rows = await db.selectFrom("image").select("filename").execute();
  return new Set(rows.map((r) => r.filename));
}
