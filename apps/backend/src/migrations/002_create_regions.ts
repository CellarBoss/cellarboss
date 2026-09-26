import type { UntypedKysely } from "@schema/untyped.js";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
  await addIdColumn(db.schema.createTable("region"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .addColumn("countryId", "integer", (col) =>
      col.notNull().references("country.id"),
    )
    .execute();
}

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("region").execute();
}
