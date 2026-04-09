import type { Kysely } from "kysely";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await addIdColumn(db.schema.createTable("bottle"))
    .addColumn("purchaseDate", shortText(), (col) => col.notNull())
    // NB: real (not numeric/decimal) — node-pg and mysql2 return DECIMAL
    // columns as strings, but the application schema expects number.
    .addColumn("purchasePrice", "real", (col) => col.notNull())
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
