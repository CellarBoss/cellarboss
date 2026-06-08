import type { Kysely } from "kysely";
import { longText, shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
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

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("preference").execute();
}
