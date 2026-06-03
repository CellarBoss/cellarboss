import { db } from "@utils/database.js";
import { insertReturning, updateReturning } from "@utils/query-helpers.js";
import type { CreateWine, UpdateWine, WineWithCounts } from "@cellarboss/types";

type WineRowWithCounts = Omit<WineWithCounts, "tastingNotesCount"> & {
  tastingNotesCount: number | string | bigint | null;
};

function toWineWithCounts(row: WineRowWithCounts): WineWithCounts {
  return {
    ...row,
    tastingNotesCount:
      row.tastingNotesCount == null ? 0 : Number(row.tastingNotesCount),
  };
}

function selectWineWithCounts() {
  return db
    .selectFrom("wine")
    .selectAll("wine")
    .select((eb) =>
      eb
        .selectFrom("tastingNote")
        .innerJoin("vintage", "vintage.id", "tastingNote.vintageId")
        .select((eb) => eb.fn.count("tastingNote.id").as("count"))
        .whereRef("vintage.wineId", "=", "wine.id")
        .as("tastingNotesCount"),
    );
}

export async function list(): Promise<WineWithCounts[]> {
  const rows = await selectWineWithCounts().execute();
  return rows.map(toWineWithCounts);
}

export async function getById(id: number): Promise<WineWithCounts | undefined> {
  const row = await selectWineWithCounts()
    .where("id", "=", id)
    .executeTakeFirst();
  return row ? toWineWithCounts(row) : undefined;
}

export async function create(data: CreateWine): Promise<WineWithCounts> {
  const inserted = await insertReturning(db, "wine", data);
  return (await getById(inserted.id)) as WineWithCounts;
}

export async function update(
  id: number,
  data: UpdateWine,
): Promise<WineWithCounts> {
  await updateReturning(db, "wine", id, data);
  return (await getById(id)) as WineWithCounts;
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
