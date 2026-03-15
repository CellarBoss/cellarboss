import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("bottle")
    .addColumn("size", "text", (col) => col.notNull().defaultTo("standard"))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("bottle").dropColumn("size").execute();
}
