import type { Kysely } from "kysely";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("region"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .addColumn("countryId", "integer", (col) =>
      col.notNull().references("country.id"),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("region").execute();
}
