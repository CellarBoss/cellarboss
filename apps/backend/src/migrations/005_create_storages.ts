import type { Kysely } from "kysely";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("storage"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .addColumn("locationId", "integer", (col) => col.references("location.id"))
    .addColumn("parent", "integer", (col) => col.references("storage.id"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("storage").execute();
}
