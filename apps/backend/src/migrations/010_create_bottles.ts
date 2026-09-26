import type { UntypedKysely } from "@schema/untyped.js";
import { addIdColumn, shortText, decimal } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
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

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("bottle").execute();
}
