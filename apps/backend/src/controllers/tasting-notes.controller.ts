import { db } from "@utils/database.js";
import { insertReturning } from "@utils/query-helpers.js";
import type { CreateTastingNote, UpdateTastingNote } from "@cellarboss/types";

/** Base query that joins user table to resolve author name */
function baseQuery() {
  return db
    .selectFrom("tastingNote")
    .innerJoin("user", "user.id", "tastingNote.authorId")
    .select([
      "tastingNote.id",
      "tastingNote.vintageId",
      "tastingNote.date",
      "tastingNote.authorId",
      "tastingNote.score",
      "tastingNote.notes",
      "user.name as author",
    ]);
}

export async function list() {
  return await baseQuery().execute();
}

export async function getByVintageId(vintageId: number) {
  return await baseQuery()
    .where("tastingNote.vintageId", "=", vintageId)
    .execute();
}

export async function getByWineId(wineId: number) {
  return await baseQuery()
    .innerJoin("vintage", "vintage.id", "tastingNote.vintageId")
    .where("vintage.wineId", "=", wineId)
    .execute();
}

export async function getById(id: number) {
  return await baseQuery().where("tastingNote.id", "=", id).executeTakeFirst();
}

export async function create(
  data: CreateTastingNote & { authorId: string; date: string },
) {
  const inserted = await insertReturning(db, "tastingNote", data);
  return (await getById(inserted.id)) as NonNullable<
    Awaited<ReturnType<typeof getById>>
  >;
}

// Uses manual update + getById (not updateReturning) because the response
// includes a JOIN to resolve the author name from the user table.
export async function update(id: number, data: UpdateTastingNote) {
  await db
    .updateTable("tastingNote")
    .set(data)
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
  return (await getById(id)) as NonNullable<
    Awaited<ReturnType<typeof getById>>
  >;
}

export async function remove(id: number) {
  return await db
    .deleteFrom("tastingNote")
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}
