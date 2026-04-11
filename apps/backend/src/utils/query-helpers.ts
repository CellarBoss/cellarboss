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
 * Coerce a database boolean value to a JS boolean.
 * PostgreSQL returns native booleans; MySQL and SQLite return 0/1 numbers.
 * Use this when reading boolean() columns to get consistent behaviour.
 */
export function toBool(value: boolean | number): boolean {
  return value === true || value === 1;
}

/**
 * Insert a row and return the full inserted record.
 * SQLite/PostgreSQL use native RETURNING; MySQL does insert + select-by-insertId.
 *
 * On MySQL, this only works for tables with an auto-increment primary key.
 * For tables with non-auto-increment PKs, insert manually and select back.
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
    if (!id) {
      throw new Error(
        `insertReturning: table "${table}" returned insertId 0. ` +
          `This helper requires an auto-increment primary key on MySQL.`,
      );
    }
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
