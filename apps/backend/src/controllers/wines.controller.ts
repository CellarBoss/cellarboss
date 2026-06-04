import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateWine, UpdateWine } from "@cellarboss/types";

export async function list() {
  return await db.selectFrom("wine").selectAll().execute();
}

export async function getById(id: number) {
  return await db
    .selectFrom("wine")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function create(data: CreateWine) {
  return await insertReturning(db, "wine", data);
}

export async function update(id: number, data: UpdateWine) {
  return await updateReturning(db, "wine", id, data);
}

export async function remove(id: number) {
  return await db.transaction().execute(async (trx) => {
    const vintages = await trx
      .selectFrom("vintage")
      .where("wineId", "=", id)
      .select("id")
      .execute();

    if (vintages.length > 0) {
      throw new Error("Cannot delete wine: it still has vintages associated");
    }

    await trx.deleteFrom("winegrape").where("wineId", "=", id).execute();

    return await trx
      .deleteFrom("wine")
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  });
}
