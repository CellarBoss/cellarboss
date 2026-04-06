import type {
  Kysely,
  Transaction,
  InsertObject,
  UpdateObject,
  Selectable,
} from "kysely";
import type { Database } from "@schema/database.js";
import { env } from "./env.js";

type DbOrTrx = Kysely<Database> | Transaction<Database>;

/**
 * Insert a row and return the full inserted record.
 * SQLite/PostgreSQL use native RETURNING; MySQL does insert + select-by-insertId.
 */
export async function insertReturning<T extends keyof Database & string>(
  dbOrTrx: DbOrTrx,
  table: T,
  values: InsertObject<Database, T>,
): Promise<Selectable<Database[T]>> {
  if (env.DATABASE_TYPE === "mysql") {
    const result = await (dbOrTrx as any)
      .insertInto(table)
      .values(values)
      .executeTakeFirstOrThrow();
    const id = Number(result.insertId);
    return await (dbOrTrx as any)
      .selectFrom(table)
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirstOrThrow();
  }

  return await (dbOrTrx as any)
    .insertInto(table)
    .values(values)
    .returningAll()
    .executeTakeFirstOrThrow();
}

/**
 * Update a row by primary key and return the full updated record.
 * SQLite/PostgreSQL use native RETURNING; MySQL does update + select.
 */
export async function updateReturning<T extends keyof Database & string>(
  dbOrTrx: DbOrTrx,
  table: T,
  id: number | string,
  values: UpdateObject<Database, T>,
  idColumn: string = "id",
): Promise<Selectable<Database[T]>> {
  if (env.DATABASE_TYPE === "mysql") {
    await (dbOrTrx as any)
      .updateTable(table)
      .set(values)
      .where(idColumn, "=", id)
      .execute();
    return await (dbOrTrx as any)
      .selectFrom(table)
      .selectAll()
      .where(idColumn, "=", id)
      .executeTakeFirstOrThrow();
  }

  return await (dbOrTrx as any)
    .updateTable(table)
    .set(values)
    .where(idColumn, "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}
