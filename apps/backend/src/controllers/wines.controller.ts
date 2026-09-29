import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import { tastingNoteCountsByWineIds } from "@utils/aggregates.js";
import type {
  CreateWine,
  UpdateWine,
  Wine,
  WineDetail,
} from "@cellarboss/types";

export async function list(): Promise<WineDetail[]> {
  const [rows, noteCounts] = await Promise.all([
    db.selectFrom("wine").selectAll().execute(),
    tastingNoteCountsByWineIds(),
  ]);
  return rows.map((row) => toDetail(row, noteCounts));
}

export async function getById(id: number): Promise<WineDetail | undefined> {
  const row = await db
    .selectFrom("wine")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
  if (!row) return undefined;
  return toDetail(row, await tastingNoteCountsByWineIds([id]));
}

function toDetail(row: Wine, noteCounts: Map<number, number>): WineDetail {
  return { ...row, tastingNotesCount: noteCounts.get(row.id) ?? 0 };
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
