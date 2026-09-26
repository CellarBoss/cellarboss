import type { UntypedKysely } from "@schema/untyped.js";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
  await addIdColumn(db.schema.createTable("storage"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .addColumn("locationId", "integer", (col) => col.references("location.id"))
    .addColumn("parent", "integer", (col) => col.references("storage.id"))
    .execute();
}

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("storage").execute();
}
