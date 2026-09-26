import type { UntypedKysely } from "@schema/untyped.js";
import { addIdColumn, shortText } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
  await addIdColumn(db.schema.createTable("country"))
    .addColumn("name", shortText(), (col) => col.notNull())
    .execute();
}

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("country").execute();
}
