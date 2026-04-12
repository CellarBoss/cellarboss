import type { Kysely } from "kysely";
import { addIdColumn, shortText, decimal } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("bottle"))
    .addColumn("purchaseDate", shortText(), (col) => col.notNull())
    .addColumn("purchasePrice", decimal(), (col) => col.notNull())
    .addColumn("vintageId", "integer", (col) =>
      col.notNull().references("vintage.id"),
    )
    .addColumn("storageId", "integer", (col) => col.references("storage.id"))
    .addColumn("status", shortText(), (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("bottle").execute();
}
