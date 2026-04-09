import type { Kysely } from "kysely";
import { shortText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("bottle")
    // shortText (not longText) — MySQL TEXT columns cannot have a default.
    .addColumn("size", shortText(), (col) =>
      col.notNull().defaultTo("standard"),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("bottle").dropColumn("size").execute();
}
