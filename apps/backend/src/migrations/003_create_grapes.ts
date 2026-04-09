import type { Kysely } from "kysely";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("grape"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("grape").execute();
}
