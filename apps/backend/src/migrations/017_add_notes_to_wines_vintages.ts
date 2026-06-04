import type { Kysely } from "kysely";
import { longText } from "@utils/migration-helpers.js";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("wine").addColumn("notes", longText()).execute();
  await db.schema
    .alterTable("vintage")
    .addColumn("notes", longText())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("vintage").dropColumn("notes").execute();
  await db.schema.alterTable("wine").dropColumn("notes").execute();
}
