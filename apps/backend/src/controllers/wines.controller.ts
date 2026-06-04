import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateWine, UpdateWine, Wine } from "@cellarboss/types";

type WineRow = Omit<Wine, "notes"> & { notes: string | null };

function toWine(row: WineRow): Wine {
  return {
    ...row,
    notes: row.notes ?? "",
  };
}

export async function list() {
  const rows = await db.selectFrom("wine").selectAll().execute();
  return rows.map(toWine);
}

export async function getById(id: number) {
  const row = await db
    .selectFrom("wine")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  return row ? toWine(row) : undefined;
}

export async function create(data: CreateWine) {
  const row = await insertReturning(db, "wine", data);
  return toWine(row);
}

export async function update(id: number, data: UpdateWine) {
  const row = await updateReturning(db, "wine", id, data);
  return toWine(row);
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
