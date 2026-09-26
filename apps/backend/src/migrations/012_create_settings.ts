import type { UntypedKysely } from "@schema/untyped.js";
import { longText, shortText } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
  await db.schema
    .createTable("setting")
    .addColumn("key", shortText(), (col) => col.primaryKey())
    .addColumn("value", longText(), (col) => col.notNull())
    .execute();
}

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("setting").execute();
}
