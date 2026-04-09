import type { Kysely } from "kysely";
import { longText, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("setting")
    .addColumn("key", shortText(), (col) => col.primaryKey())
    .addColumn("value", longText(), (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("setting").execute();
}
