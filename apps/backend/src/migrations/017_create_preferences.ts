import type { UntypedKysely } from "@schema/untyped.js";
import { longText, shortText } from "@utils/migration-helpers.js";

export async function up(db: UntypedKysely): Promise<void> {
  await db.schema
    .createTable("preference")
    .addColumn("userId", shortText(), (col) =>
      col.notNull().references("user.id").onDelete("cascade"),
    )
    .addColumn("key", shortText(), (col) => col.notNull())
    .addColumn("value", longText(), (col) => col.notNull())
    .addPrimaryKeyConstraint("pk_preference", ["userId", "key"])
    .execute();
}

export async function down(db: UntypedKysely): Promise<void> {
  await db.schema.dropTable("preference").execute();
}
